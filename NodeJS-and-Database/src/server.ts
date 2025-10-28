// src/server.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { pool } from './db';
import { RowDataPacket, OkPacket, PoolConnection } from 'mysql2/promise';

// Types 
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  pubDate: string; // YYYY-MM-DD
  genre: string;
}

// This query result now joins with Genres 
interface BookQueryResult extends RowDataPacket {
  id: string;
  title: string;
  author: string;
  isbn: string;
  pubDate: string;
  genre: string;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(cors());
app.use(express.json());

// Helper Functions

// REMOVED categorizeGenre function 

const getOrCreateAuthorId = async (conn: PoolConnection, authorName: string): Promise<number> => {
  let [rows] = await conn.execute<RowDataPacket[]>(
    'SELECT id FROM Authors WHERE name = ?', 
    [authorName]
  );
  if (rows.length > 0) return rows[0].id;
  
  const [result] = await conn.execute<OkPacket>(
    'INSERT INTO Authors (name) VALUES (?)', 
    [authorName]
  );
  return result.insertId;
};

/**
  Finds a genre by name or creates a new one.
 @returns The ID of the genre.
 */
const getOrCreateGenreId = async (conn: PoolConnection, genreName: string): Promise<number> => {
  // Use the genreName 
  let [rows] = await conn.execute<RowDataPacket[]>(
    'SELECT id FROM Genres WHERE name = ?', 
    [genreName]
  );
  
  if (rows.length > 0) return rows[0].id;
  
  // Create it if it doesn't exist 
  const [result] = await conn.execute<OkPacket>(
    'INSERT INTO Genres (name) VALUES (?)', 
    [genreName]
  );
  return result.insertId;
};

// --- API Endpoints ---

app.get('/api/books', async (req: Request, res: Response) => {
  try {
    //  UPDATED QUERY: Join with Genres and select g.name as genre 
    const [rows] = await pool.execute<BookQueryResult[]>(`
      SELECT 
        b.id, 
        b.title, 
        b.isbn, 
        b.publication_date AS pubDate, 
        g.name AS genre, 
        a.name AS author
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

app.post('/api/books', async (req: Request, res: Response) => {
  
  const { title, author, isbn, pubDate, genre } = req.body as Omit<Book, 'id'>;
  
  if (!title || !author || !isbn || !pubDate || !genre) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newBookId = uuidv4();
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const authorId = await getOrCreateAuthorId(conn, author);
    const genreId = await getOrCreateGenreId(conn, genre); // Use new function

    // UPDATED QUERY
    await conn.execute(
      `INSERT INTO Books 
         (id, title, author_id, genre_id, isbn, publication_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newBookId, title, authorId, genreId, isbn, pubDate]
    );

    await conn.commit();
    
    const newBook: Book = { id: newBookId, title, author, isbn, pubDate, genre };
    res.status(201).json(newBook);

  } catch (error) {
    await conn.rollback();
    console.error('Error adding book:', error);
    const dbError = error as { code?: string };
    if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Error: A book with this ISBN already exists.' });
    }
    res.status(500).json({ message: 'Error adding book' });
  } finally {
    conn.release();
  }
});

app.put('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, author, isbn, pubDate, genre } = req.body as Book;

  if (!title || !author || !isbn || !pubDate || !genre) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const authorId = await getOrCreateAuthorId(conn, author);
    const genreId = await getOrCreateGenreId(conn, genre); // Use new function

    // UPDATED QUERY
    const [result] = await conn.execute<OkPacket>(
      `UPDATE Books SET
         title = ?, 
         author_id = ?, 
         genre_id = ?, 
         isbn = ?,
         publication_date = ?
       WHERE id = ?`,
      [title, authorId, genreId, isbn, pubDate, id]
    );
    
    await conn.commit();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ id, title, author, isbn, pubDate, genre });

  } catch (error) {
    await conn.rollback();
    console.error('Error updating book:', error);
    const dbError = error as { code?: string };
     if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Error: A book with this ISBN already exists.' });
    }
    res.status(500).json({ message: 'Error updating book' });
  } finally {
    conn.release();
  }
});

app.delete('/api/books/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [result] = await pool.execute<OkPacket>(
      'DELETE FROM Books WHERE id = ?', 
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(204).send();

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Error deleting book' });
  }
});

//Server Start 
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});