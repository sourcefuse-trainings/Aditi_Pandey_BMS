import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Define the path to our JSON "database" file
const DB_PATH = path.resolve('data/books.json');

// In-memory cache of our books data, loaded from the file
let books = [];

// Helper function to read data from the file into the in-memory cache
const readData = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        books = JSON.parse(data);
        console.log('Book data loaded successfully from books.json');
    } catch (error) {
        // If the file doesn't exist, is empty, or has invalid JSON, start with an empty array
        console.error('Could not read books.json, starting with an empty list.', error);
        books = [];
    }
};

// Helper function to write the in-memory cache to the file
const writeData = async () => {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(books, null, 2));
    } catch (error) {
        console.error('Failed to write to books.json', error);
    }
};

// --- API Endpoints ---

// GET /api/books - Get all books
router.get('/', (req, res) => {
  res.json(books);
});

// GET /api/books/:id - Get a single book by ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// POST /api/books - Add a new book
router.post('/', async (req, res) => {
  const { title, author, isbn, pubDate, genre } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required.' });
  }

  const newBook = { id: uuidv4(), title, author, isbn, pubDate, genre };
  books.push(newBook);
  
  await writeData();
  
  console.log('Book added:', newBook.title);
  res.status(201).json(newBook);
});

// PUT /api/books/:id - Update an existing book
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const index = books.findIndex(b => b.id === id);

  if (index !== -1) {
    const updatedBook = { ...books[index], ...req.body };
    books[index] = updatedBook;
    
    await writeData();

    console.log('Book updated:', updatedBook.title);
    res.json(updatedBook);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// DELETE /api/books/:id - Delete a book
router.delete('/:id', async (req, res) => {
  const index = books.findIndex(b => b.id === req.params.id);
  
  if (index !== -1) {
    const [deletedBook] = books.splice(index, 1);

    await writeData();

    console.log('Book deleted:', deletedBook.title);
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// POST /api/books/fetch-external - Fetch external books and add them
router.post('/fetch-external', async (req, res) => {
    console.log("Fetching external books from API...");
    try {
        const randomStart = Math.floor(Math.random() * 97);
        const url = `https://jsonplaceholder.typicode.com/posts?_start=${randomStart}&_limit=3`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const data = await response.json();
        const fetchedBooks = data.map(post => ({
            id: uuidv4(),
            title: post.title.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
            author: `User ${post.userId}`,
            isbn: `1000-${post.id}`,
            pubDate: "2023-05-10",
            genre: "general",
        }));
        
        const newBooks = fetchedBooks.filter(fb => !books.some(eb => eb.title === fb.title));
        
        if (newBooks.length > 0) {
            books.push(...newBooks);
            await writeData(); // Write the final list to the file
            console.log(`Added ${newBooks.length} new books from API.`);
        } else {
            console.log("No new unique books to add from the API fetch.");
        }
        
        res.status(201).json({ message: `Added ${newBooks.length} new books.`, allBooks: books });
    } catch (error) {
        console.error("Failed to fetch from external API", error);
        res.status(500).json({ message: 'Failed to fetch from external API' });
    }
});

// Initialize the data by reading from the file when the module first loads
readData();

export default router;