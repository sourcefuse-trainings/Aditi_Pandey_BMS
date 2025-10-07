import type { Book } from '../types';
import { logger } from '../utils/logger';

const API_BASE_URL = 'http://localhost:3001/api/books';

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        // For 204 No Content, there's no body to parse
        if (response.status === 204) {
            return null;
        }
        const error = await response.json();
        throw new Error(error.message || `HTTP error! Status: ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
};

export const bookService = {
    async getBooks(): Promise<Book[]> {
        logger.info("Fetching all books from the backend...");
        const response = await fetch(API_BASE_URL);
        return handleResponse(response);
    },

    async addBook(book: Omit<Book, 'id'>): Promise<Book> {
        logger.info(`Adding book: "${book.title}"`);
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(book),
        });
        return handleResponse(response);
    },

    async updateBook(updatedBook: Book): Promise<Book> {
        logger.info(`Updating book: "${updatedBook.title}"`);
        const response = await fetch(`${API_BASE_URL}/${updatedBook.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedBook),
        });
        return handleResponse(response);
    },

    async deleteBook(id: string): Promise<void> {
        logger.info(`Deleting book with ID: ${id}`);
        await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
    },

    async fetchBooksFromApi(): Promise<Book[]> {
        logger.info("Requesting backend to fetch new books...");
        const response = await fetch(`${API_BASE_URL}/fetch-external`, { method: 'POST' });
        const result = await handleResponse(response);
        logger.success(result.message);
        return result.allBooks;
    },
};