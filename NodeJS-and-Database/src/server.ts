// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Helper functions
const getOrCreateAuthorId = async (conn: any, authorName: string): Promise<number> => {
  const [rows] = await conn.execute('SELECT id FROM Authors WHERE name = ?', [authorName]);
  if (rows.length > 0) return rows[0].id;
  const [result]: any = await conn.execute('INSERT INTO Authors (name) VALUES (?)', [authorName]);
  return result.insertId;
};

const getGenreId = async (conn: any, genreName: string): Promise<number | null> => {
  const [rows] = await conn.execute('SELECT id FROM Genres WHERE name = ?', [genreName]);
  return rows.length > 0 ? rows[0].id : null;
};

const formatDateForMySQL = (dateString: string): string | null => {
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString().split('T')[0];
};

// GET all books
app.get('/api/books', async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        b.id, b.title, b.isbn, 
        b.publication_date AS pubDate, 
        g.name AS genre, a.name AS author
      FROM Books b
      JOIN Authors a ON b.author_id = a.id
      JOIN Genres g ON b.genre_id = g.id
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// POST create book
app.post('/api/books', async (req: Request, res: Response) => {
  const { title, author, isbn, pubDate, genre } = req.body;

  if (!title || !author || !isbn || !pubDate || !genre) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const authorId = await getOrCreateAuthorId(conn, author);
    const genreId = await getGenreId(conn, genre);

    if (genreId === null) {
      await conn.rollback();
      return res.status(400).json({ message: `Genre '${genre}' does not exist.` });
    }

    const formattedDate = formatDateForMySQL(pubDate);
    if (!formattedDate) {
      await conn.rollback();
      return res.status(400).json({ message: `Invalid date format: ${pubDate}` });
    }

    const newBookId = uuidv4();
    await conn.execute(
      `INSERT INTO Books (id, title, author_id, genre_id, isbn, publication_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newBookId, title, authorId, genreId, isbn, formattedDate]
    );

    await conn.commit();
    res.status(201).json({ id: newBookId, title, author, isbn, pubDate, genre });
  } catch (error: any) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'A book with this ISBN already exists' });
    }
    res.status(500).json({ message: 'Error adding book' });
  } finally {
    conn.release();
  }
});

// PUT update book
app.put('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, isbn, pubDate, genre } = req.body;
  const setClauses: string[] = [];
  const values: any[] = [];

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (title) { setClauses.push('title = ?'); values.push(title); }
    if (isbn) { setClauses.push('isbn = ?'); values.push(isbn); }
    if (author) {
      const authorId = await getOrCreateAuthorId(conn, author);
      setClauses.push('author_id = ?');
      values.push(authorId);
    }
    if (genre) {
      const genreId = await getGenreId(conn, genre);
      if (genreId === null) {
        await conn.rollback();
        return res.status(400).json({ message: `Genre '${genre}' does not exist.` });
      }
      setClauses.push('genre_id = ?');
      values.push(genreId);
    }
    if (pubDate) {
      const formattedDate = formatDateForMySQL(pubDate);
      if (!formattedDate) {
        await conn.rollback();
        return res.status(400).json({ message: `Invalid date format: ${pubDate}` });
      }
      setClauses.push('publication_date = ?');
      values.push(formattedDate);
    }

    if (!setClauses.length) {
      await conn.rollback();
      return res.status(400).json({ message: 'No fields to update.' });
    }

    values.push(id);
    const sql = `UPDATE Books SET ${setClauses.join(', ')} WHERE id = ?`;
    const [result]: any = await conn.execute(sql, values);

    await conn.commit();
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });

    res.json({ message: 'Book updated successfully' });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ message: 'Error updating book' });
  } finally {
    conn.release();
  }
});

// DELETE book
app.delete('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result]: any = await pool.execute('DELETE FROM Books WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Book not found' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Error deleting book' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));