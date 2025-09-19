import { v4 as uuidv4 } from 'uuid';
import type { Book } from '../types';
import { logger } from '../utils/logger';

// Initial data to populate if localStorage is empty
const initialBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', pubDate: '1925-04-10', genre: 'fiction' },
    { id: '2', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', pubDate: '1988-03-01', genre: 'science' }
];

const BOOKS_STORAGE_KEY = 'books';

/**
 * Saves the list of books to localStorage.
 * @param books - The array of books to save.
 */
const saveBooks = (books: Book[]): void => {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
    logger.info(`${books.length} books saved to localStorage.`);
};

/**
 * BookService encapsulates all business logic for book operations.
 */
export const bookService = {
    /**
     * Retrieves all books from localStorage.
     * If no books are found, it initializes with default data.
     * @returns An array of books.
     */
    getBooks(): Book[] {
        try {
            const savedBooks = localStorage.getItem(BOOKS_STORAGE_KEY);
            return savedBooks ? JSON.parse(savedBooks) : initialBooks;
        } catch (error) {
            logger.error("Failed to parse books from localStorage", error);
            return initialBooks;
        }
    },

    /**
     * Adds a new book to the list and saves it.
     * @param book - The book object to add.
     * @returns The updated array of books.
     */
    addBook(book: Omit<Book, 'id'>): Book[] {
        const currentBooks = this.getBooks();
        const newBook = { ...book, id: uuidv4() };
        const updatedBooks = [...currentBooks, newBook];
        saveBooks(updatedBooks);
        logger.success(`Book added: "${newBook.title}"`);
        return updatedBooks;
    },

    /**
     * Updates an existing book in the list and saves the changes.
     * @param updatedBook - The book with updated information.
     * @returns The updated array of books.
     */
    updateBook(updatedBook: Book): Book[] {
        let currentBooks = this.getBooks();
        const updatedBooks = currentBooks.map(book => 
            book.id === updatedBook.id ? updatedBook : book
        );
        saveBooks(updatedBooks);
        logger.success(`Book updated: "${updatedBook.title}"`);
        return updatedBooks;
    },

    /**
     * Deletes a book by its ID.
     * @param id - The ID of the book to delete.
     * @returns The updated array of books.
     */
    deleteBook(id: string): Book[] | null {
        let currentBooks = this.getBooks();
        const bookToDelete = currentBooks.find(b => b.id === id);
        if (bookToDelete && window.confirm(`Are you sure you want to delete "${bookToDelete.title}"?`)) {
            const updatedBooks = currentBooks.filter(book => book.id !== id);
            saveBooks(updatedBooks);
            logger.info(`Book deleted: "${bookToDelete.title}"`);
            return updatedBooks;
        }
        return null; // Return null if deletion was cancelled
    },

    /**
     * Fetches a list of books from an external API.
     * @returns A promise that resolves to an array of new books.
     */
    async fetchBooksFromApi(): Promise<Book[]> {
        logger.info("Fetching books from API...");
        const url = `https://jsonplaceholder.typicode.com/posts?_limit=5&_=${Date.now()}`;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Maps the API data to our Book type
        return data.map((post: any) => ({
            id: uuidv4(),
            title: post.title.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            author: `User ${post.userId}`,
            isbn: `979-8-1234-5678-${post.id}`,
            pubDate: "2023-05-10",
            genre: "general",
        }));
    },

    /**
     * Merges fetched books into the existing list, avoiding duplicates by title.
     * @param existingBooks - The current list of books.
     * @param fetchedBooks - The new books fetched from the API.
     * @returns The merged list of books.
     */
    addFetchedBooks(existingBooks: Book[], fetchedBooks: Book[]): Book[] {
        const newBooks = fetchedBooks.filter(
            fetchedBook => !existingBooks.some(existingBook => existingBook.title === fetchedBook.title)
        );
        if (newBooks.length > 0) {
            const updatedBooks = [...existingBooks, ...newBooks];
            saveBooks(updatedBooks);
            logger.success(`Added ${newBooks.length} new books from API.`);
            return updatedBooks;
        }
        logger.info("No new books to add from the API fetch.");
        return existingBooks;
    }
};