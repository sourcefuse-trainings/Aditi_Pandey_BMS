"use strict";
// src/script.ts
// ============================================================================
// BOOK MANAGEMENT APP (TypeScript)
// ============================================================================
// This script implements a simple client-side book manager. 
// It demonstrates TypeScript interfaces, decorators, DOM interaction, 
// logging utilities, async API integration, and adherence to SOLID principles.
// ============================================================================
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* ============================================================================
   2. LOGGER CLASS
   ============================================================================ */
/**
 * Logger is a utility class that provides styled console logging
 * with timestamps. It has three main methods: info, success, error.
 *
 * SOLID:
 * - SRP: Dedicated solely to logging (not mixed with business logic).
 * - Open/Closed Principle (OCP): Can be extended (e.g., add file logging)
 *   without modifying existing methods.
 */
class Logger {
    /** Generates an ISO timestamp string */
    getTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Internal method to apply CSS styling to log messages.
     * Returns tuple: [formatted message, css].
     */
    colorize(message, color) {
        const css = `color: ${color}; font-weight: bold;`;
        const plainText = `[${this.getTimestamp()}] ${message}`;
        return [plainText, css];
    }
    /** Logs info messages in blue. */
    info(message) {
        const [plainText, css] = this.colorize(`INFO: ${message}`, 'deepskyblue');
        console.log(`%c${plainText}`, css);
    }
    /** Logs success messages in green. */
    success(message) {
        const [plainText, css] = this.colorize(`SUCCESS: ${message}`, 'mediumseagreen');
        console.log(`%c${plainText}`, css);
    }
    /** Logs error messages in red, optionally with an error object. */
    error(message, errorObj) {
        const errorMessage = errorObj ? `${message} - ${errorObj.message}` : message;
        const [plainText, css] = this.colorize(`ERROR: ${errorMessage}`, 'crimson');
        console.error(`%c${plainText}`, css);
    }
}
/* ============================================================================
   3. METHOD DECORATOR
   ============================================================================ */
/**
 * Decorator factory that logs when a method starts and finishes.
 * Useful for tracing method activity.
 *
 * SOLID:
 * - Open/Closed Principle (OCP): Adds logging behavior without
 *   changing the original method implementation.
 * - SRP: Keeps logging concern separate from business logic.
 */
function LogMethodActivity(logger) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            logger.info(`Calling method: ${propertyKey}`);
            const result = originalMethod.apply(this, args);
            logger.info(`Method ${propertyKey} finished execution.`);
            return result;
        };
        return descriptor;
    };
}
/* ============================================================================
   4. BOOK MANAGER CLASS
   ============================================================================ */
/**
 * The BookManager class handles all core logic:
 * - Managing the book list (CRUD)
 * - Applying filters/sorting
 * - Rendering DOM views
 * - Fetching books from external API
 *
 * SOLID:
 * - SRP: A bit stretched — handles multiple concerns (UI, data, logic).
 *   Ideally, UI rendering and data management would be separated.
 * - Liskov Substitution (LSP): Not directly applicable, but methods are
 *   consistent and predictable in return types.
 * - Dependency Inversion (DIP): Depends on abstractions (Logger) instead of
 *   raw console calls.
 */
class BookManager {
    constructor() {
        this.books = []; // Stores all books
        this.editingIndex = null; // Tracks currently editing book
        this.logger = new Logger(); // For structured logging
        this.initEventListeners();
        this.attachMethodsToWindow();
        this.logger.info("BookManager initialized.");
    }
    /**
     * Utility: Safely query a DOM element by selector.
     * Throws error if element not found.
     *
     * SRP: Dedicated solely to DOM selection.
     */
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element with selector "${selector}" not found.`);
        }
        return element;
    }
    /**
     * Attaches selected class methods to the global window object,
     * allowing inline HTML event handlers to work.
     */
    attachMethodsToWindow() {
        const customWindow = window;
        customWindow.editBook = this.editBook.bind(this);
        customWindow.deleteBook = this.deleteBook.bind(this);
        customWindow.showPage = this.showPage.bind(this);
    }
    /**
     * Shows a page by ID, hides all others.
     * Handles additional rendering when switching pages.
     */
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
        this.getElement(`#${pageId}`).classList.remove('hidden');
        if (pageId === 'viewBooksPage')
            this.applyFiltersAndSort();
        if (pageId === 'deleteBookPage')
            this.renderDeleteList();
    }
    /** Calculates the age of a book since publication. */
    calculateAge(pubDate) {
        const publication = new Date(pubDate);
        const today = new Date();
        let years = today.getFullYear() - publication.getFullYear();
        let months = today.getMonth() - publication.getMonth();
        let days = today.getDate() - publication.getDate();
        if (days < 0) {
            months--;
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }
        return `${years} years ${months} months ${days} days`;
    }
    /** Maps book genres to human-readable categories. */
    categorizeGenre(genre) {
        const categories = {
            fiction: 'Entertainment',
            science: 'Educational',
            history: 'Informational',
            biography: 'Inspirational',
            technology: 'Technical',
            romance: 'Emotional'
        };
        return categories[genre.toLowerCase()] || 'General';
    }
    /**
     * Renders a list of books as styled cards.
     */
    renderFilteredBooks(filteredBooks) {
        const bookCardsContainer = this.getElement("#bookCardsContainer");
        bookCardsContainer.innerHTML = '';
        filteredBooks.forEach((book, i) => {
            const card = document.createElement('div');
            card.className = "p-6 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-md text-white flex flex-col justify-between hover:scale-[1.02] transition-transform";
            card.innerHTML = `
        <div class="space-y-2">
          <h3 class="text-xl font-bold">${book.title}</h3>
          <p><span class="font-semibold">Author:</span> ${book.author}</p>
          <p><span class="font-semibold">ISBN:</span> ${book.isbn}</p>
          <p><span class="font-semibold">Age:</span> ${book.age}</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-sm bg-gradient-accent text-white shadow">${book.genre}</span>
        </div>
        <button onclick="editBook(${i})" class="mt-4 px-4 py-2 rounded-md bg-gradient-primary text-white font-medium shadow hover:shadow-lg hover:scale-105 transition-all">
          ✏ Edit
        </button>
      `;
            bookCardsContainer.appendChild(card);
        });
    }
    /**
     * Filters books by search/genre and sorts alphabetically.
     * Decorated to log activity automatically.
     */
    applyFiltersAndSort() {
        var _a, _b;
        const searchQuery = ((_a = this.getElement("#searchInput")) === null || _a === void 0 ? void 0 : _a.value.toLowerCase()) || "";
        const genreQuery = ((_b = this.getElement("#filterGenre")) === null || _b === void 0 ? void 0 : _b.value.toLowerCase()) || "";
        let filteredBooks = this.books.filter(book => {
            const matchesSearch = book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery);
            const matchesGenre = genreQuery ? book.genre.toLowerCase() === genreQuery : true;
            return matchesSearch && matchesGenre;
        });
        filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
        this.renderFilteredBooks(filteredBooks);
    }
    /** Renders a list of books with delete buttons. */
    renderDeleteList() {
        const list = this.getElement('#deleteList');
        list.innerHTML = '';
        this.books.forEach((book, i) => {
            const li = document.createElement('li');
            li.className = "flex justify-between items-center p-4 rounded-md bg-white/10 border border-white/20 text-white";
            li.innerHTML = `
        <span>${book.title} - ${book.author}</span>
        <button onclick="deleteBook(${i})" class="px-3 py-1 rounded bg-gradient-danger text-white shadow hover:scale-105 transition-all">
          🗑 Delete
        </button>
      `;
            list.appendChild(li);
        });
    }
    /** Deletes a book from the list and refreshes views. */
    deleteBook(index) {
        const deletedBook = this.books[index];
        this.books.splice(index, 1);
        this.logger.info(`Deleted book: "${deletedBook.title}"`);
        this.renderDeleteList();
        this.applyFiltersAndSort();
    }
    /** Loads book data into form for editing. */
    editBook(index) {
        const book = this.books[index];
        this.editingIndex = index;
        this.getElement('#title').value = book.title;
        this.getElement('#author').value = book.author;
        this.getElement('#isbn').value = book.isbn;
        this.getElement('#pubDate').value = book.pubDate;
        this.getElement('#genre').value = book.genre;
        this.getElement('#formTitle').textContent = "Edit Book";
        this.getElement('#submitBtn').textContent = "Save Changes";
        this.showPage('addBookPage');
    }
    /** Fetches external dummy books from JSONPlaceholder API. */
    fetchExternalBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://jsonplaceholder.typicode.com/posts?_limit=3&_=${Date.now()}`;
            const response = yield fetch(url, { cache: "no-store" });
            if (!response.ok)
                throw new Error(`HTTP error! Status: ${response.status}`);
            const data = yield response.json();
            return data.map((post) => ({
                title: post.title,
                author: `User ${post.userId}`,
                isbn: `123${post.id}`,
                pubDate: "2020-01-01",
                genre: "general",
                age: this.calculateAge("2020-01-01"),
                category: "general"
            }));
        });
    }
    /**
     * Loads external books into the app asynchronously.
     * Shows a spinner, handles errors gracefully.
     * Decorated for activity logging.
     */
    loadBooksAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            const loadingSpinner = this.getElement("#loadingSpinner");
            const errorContainer = this.getElement("#errorContainer");
            loadingSpinner.classList.remove("hidden");
            errorContainer.classList.add("hidden");
            try {
                const externalBooks = yield this.fetchExternalBooks();
                this.books.push(...externalBooks);
                this.logger.success(`Successfully fetched ${externalBooks.length} books from API.`);
                this.applyFiltersAndSort();
            }
            catch (error) {
                this.logger.error("Failed to load books from API", error);
                errorContainer.textContent = `Failed to load books: ${error.message}`;
                errorContainer.classList.remove("hidden");
            }
            finally {
                loadingSpinner.classList.add("hidden");
            }
        });
    }
    /** Initializes all event listeners (form submission, buttons, filters). */
    initEventListeners() {
        // Handle book form submission
        this.getElement('#bookForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = this.getElement('#title').value.trim();
            const author = this.getElement('#author').value.trim();
            const isbn = this.getElement('#isbn').value.trim();
            const pubDate = this.getElement('#pubDate').value;
            const genre = this.getElement('#genre').value.trim();
            if (!title || !author || !isbn || !pubDate || !genre) {
                this.logger.error("All fields must be filled out.");
                return alert('Fill all fields!');
            }
            if (isNaN(Number(isbn))) {
                this.logger.error("ISBN must be a numeric value.");
                return alert('ISBN must be numeric!');
            }
            const book = {
                title,
                author,
                isbn,
                pubDate,
                genre,
                age: this.calculateAge(pubDate),
                category: this.categorizeGenre(genre)
            };
            if (this.editingIndex !== null) {
                this.books[this.editingIndex] = book;
                this.logger.success(`Book updated: "${book.title}"`);
                this.editingIndex = null;
                this.getElement('#formTitle').textContent = "Add a New Book";
                this.getElement('#submitBtn').textContent = "Add Book";
            }
            else {
                this.books.push(book);
                this.logger.success(`New book added: "${book.title}"`);
            }
            e.target.reset();
            this.applyFiltersAndSort();
            this.showPage('viewBooksPage');
        });
        // Handle API fetch button
        this.getElement("#fetchApiBtn").addEventListener("click", () => this.loadBooksAsync());
        // Handle search + filter
        document.addEventListener("DOMContentLoaded", () => {
            var _a, _b;
            (_a = this.getElement("#filterGenre")) === null || _a === void 0 ? void 0 : _a.addEventListener("change", () => this.applyFiltersAndSort());
            (_b = this.getElement("#searchInput")) === null || _b === void 0 ? void 0 : _b.addEventListener("input", () => this.applyFiltersAndSort());
        });
    }
}
__decorate([
    LogMethodActivity(new Logger())
], BookManager.prototype, "applyFiltersAndSort", null);
__decorate([
    LogMethodActivity(new Logger())
], BookManager.prototype, "loadBooksAsync", null);
/* ============================================================================
   5. APP INITIALIZATION
   ============================================================================ */
/**
 * Bootstraps the app by creating a new BookManager instance.
 */
new BookManager();
