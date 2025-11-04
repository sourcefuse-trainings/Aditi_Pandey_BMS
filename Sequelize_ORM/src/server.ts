
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { sequelize } from './db'; 
import { Author, Book, Genre } from './models'; 
import { Op } from 'sequelize'; 

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
const formatDateForMySQL = (dateString: string): string | null => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString().split('T')[0];
};
app.get('/api/books', async (_req: Request, res: Response) => {
  try {
    const books = await Book.findAll({
      include: [
        { model: Author, as: 'author', attributes: ['name'] },
        { model: Genre, as: 'genre', attributes: ['name'] }, 
      ],
      order: [['created_at', 'DESC']],
    });
    const formattedBooks = books.map((book: Book) => ({
      id: book.id, 
      title: book.title,
      isbn: book.isbn,
      pubDate: book.publication_date,
      genre: (book as any).genre?.name, 
      author: (book as any).author?.name,
    }));

    res.json(formattedBooks);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});
app.post('/api/books', async (req: Request, res: Response) => {
  
  const { title, author, isbn, pubDate, genre } = req.body;

  if (!title || !author || !isbn || !pubDate || !genre) {
    return res.status(400).json({ message: 'All fields (title, author, isbn, pubDate, genre) are required' });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const [authorInstance] = await Author.findOrCreate({
        where: { name: author },
        defaults: { name: author }, 
        transaction: t,
      });
      const genreInstance = await Genre.findOne({
        where: { name: genre },
        transaction: t,
      });

      if (!genreInstance) {
        throw new Error(`Genre '${genre}' does not exist.`);
      }
      const formattedDate = formatDateForMySQL(pubDate);
      if (!formattedDate) {
        throw new Error(`Invalid date format: ${pubDate}`);
      }
      const newBook = await Book.create(
        {
          id: uuidv4(), 
          title,
          author_id: authorInstance.id, 
          genre_id: genreInstance.id, 
          isbn,
          publication_date: new Date(formattedDate),
        },
        { transaction: t }
      );

      return { newBook, authorInstance, genreInstance };
    });

    res.status(201).json({
      id: result.newBook.id,
      title: result.newBook.title,
      author: result.authorInstance.name,
      genre: result.genreInstance.name, 
      isbn: result.newBook.isbn,
      pubDate: result.newBook.publication_date,
    });

  } catch (error: any) {
    console.error("Error adding book:", error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A book with this ISBN already exists' });
    }
    if (error.message.startsWith('Genre') || error.message.startsWith('Invalid date')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error adding book' });
  }
});
app.put('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, isbn, pubDate, genre } = req.body; 

  try {
    const result = await sequelize.transaction(async (t) => {
      const book = await Book.findByPk(id, { transaction: t });
      if (!book) {
        throw new Error('Book not found');
      }

      const updateData: any = {};

      if (title) updateData.title = title;
      if (isbn) updateData.isbn = isbn;
      
      if (author) {
        const [authorInstance] = await Author.findOrCreate({
          where: { name: author },
          defaults: { name: author },
          transaction: t,
        });
        updateData.author_id = authorInstance.id;
      }
      
      if (genre) {
        const genreInstance = await Genre.findOne({
          where: { name: genre },
          transaction: t,
        });
        if (!genreInstance) {
          throw new Error(`Genre '${genre}' does not exist.`);
        }
        updateData.genre_id = genreInstance.id;
      }

      if (pubDate) {
        const formattedDate = formatDateForMySQL(pubDate);
        if (!formattedDate) {
          throw new Error(`Invalid date format: ${pubDate}`);
        }
        updateData.publication_date = new Date(formattedDate);
      }
      
      if (Object.keys(updateData).length === 0) {
        throw new Error('No fields to update.');
      }

      await book.update(updateData, { transaction: t });
      return book;
    });

    res.json({ message: 'Book updated successfully' });

  } catch (error: any) {
    console.error("Error updating book:", error);
    if (error.message === 'Book not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.startsWith('Genre') || error.message.startsWith('Invalid date') || error.message === 'No fields to update.') {
      return res.status(400).json({ message: error.message });
    }
     if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'A book with this ISBN already exists' });
    }
    res.status(500).json({ message: 'Error updating book' });
  }
});
app.delete('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deletedRowCount = await Book.destroy({
      where: { id: id }, 
    });

    if (deletedRowCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: 'Error deleting book' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));