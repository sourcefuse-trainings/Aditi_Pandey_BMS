// src/services/bookService.ts
import { v4 as uuidv4 } from 'uuid';
import type { Book } from '../types';
import { logger } from '../utils/logger';

// URL of your running backend server
const API_BASE_URL = 'http://localhost:4000/api'; 

/**
 * BookService encapsulates all business logic for book operations
 * by calling the backend API.
 */
export const bookService = {
    /**
     * Retrieves all books from the database via the API.
     * @returns A promise that resolves to an array of books.
     */
    async getBooks(): Promise<Book[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/books`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! Status: ${response.status}`);
            }
            const books: Book[] = await response.json();
            logger.info(`Fetched ${books.length} books from API.`);
            // Convert pubDate from DB (YYYY-MM-DD) if needed, though string is fine
            return books;
        } catch (error) {
            logger.error("Failed to fetch books", error);
            return []; // Return empty array on error
        }
    },

    /**
     * Adds a new book to the database via the API.
     * @param book - The book object to add.
     * @returns A promise that resolves to the newly added book.
     */
    async addBook(book: Omit<Book, 'id'>): Promise<Book | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! Status: ${response.status}`);
            }
            const newBook: Book = await response.json();
            logger.success(`Book added: "${newBook.title}"`);
            return newBook;
        } catch (error) {
            logger.error('Failed to add book', error);
            alert(`Error: ${error.message}`); // Show user-facing error
            return null;
        }
    },

    /**
     * Updates an existing book in the database via the API.
     * @param updatedBook - The book with updated information.
     * @returns A promise that resolves to the updated book.
     */
    async updateBook(updatedBook: Book): Promise<Book | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${updatedBook.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBook),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! Status: ${response.status}`);
            }
            const returnedBook: Book = await response.json();
            logger.success(`Book updated: "${returnedBook.title}"`);
            return returnedBook;
        } catch (error) {
            logger.error('Failed to update book', error);
            alert(`Error: ${error.message}`); // Show user-facing error
            return null;
        }
    },

    /**
     * Deletes a book by its ID from the database via the API.
     * @param id - The ID of the book to delete.
     * @returns A promise that resolves to true if deletion was successful.
     */
    async deleteBook(id: string): Promise<boolean> {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || `HTTP error! Status: ${response.status}`);
            }
            logger.info(`Book deleted: ${id}`);
            return true;
        } catch (error) {
            logger.error('Failed to delete book', error);
            alert(`Error: ${error.message}`); // Show user-facing error
            return false;
        }
    },

    /**
     * Fetches a list of books from the external JSONPlaceholder API.
     * (This logic remains the same as your original)
     * @returns A promise that resolves to an array of new books.
     */
    async fetchBooksFromApi(): Promise<Book[]> {
        logger.info("Fetching books from external API...");
        const randomStart = Math.floor(Math.random() * (100 - 3));
        const url = `https://jsonplaceholder.typicode.com/posts?_start=${randomStart}&_limit=3`;

        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        return data.map((post: any) => ({
            id: uuidv4(), // We give it a temp ID
            title: post.title
                .split(" ")
                .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
            author: `User ${post.userId}`,
            isbn: `1000-${post.id}`, // Placeholder ISBN
            pubDate: "2023-05-10", // Placeholder date
            genre: "general",
        }));
    },
    
    /**
     * This function should now be handled in your React component.
     * The component should call `fetchBooksFromApi()`, then loop through the results
     * and call `addBook(book)` for each one, updating the state as the
     * books are added.
     */
    // addFetchedBooks(...) is removed as its logic moves to the UI layer
};