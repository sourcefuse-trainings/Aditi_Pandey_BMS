// src/domService.ts

import { Book, CustomWindow } from 'interfaces';
import { BookService } from 'bookService';
import { Logger } from 'logger';
import { App } from 'app';

export class DOMService {
  private editingIndex: number | null = null;

  constructor(
    private readonly bookService: BookService,
    private readonly logger: Logger,
    private readonly app: App
  ) {
    this.initEventListeners();
    this.attachMethodsToWindow();
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found.`);
    }
    return element;
  }

  private attachMethodsToWindow(): void {
    const customWindow = window as CustomWindow;
    customWindow.editBook = this.editBook.bind(this);
    customWindow.deleteBook = this.deleteBook.bind(this);
    customWindow.showPage = this.showPage.bind(this);
  }

  public showPage(pageId: string): void {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    this.getElement(`#${pageId}`).classList.remove('hidden');
    if (pageId === 'viewBooksPage') this.applyFiltersAndSort();
    if (pageId === 'deleteBookPage') this.renderDeleteList();
  }

  public renderFilteredBooks(filteredBooks: Book[]): void {
    const bookCardsContainer = this.getElement<HTMLElement>("#bookCardsContainer");
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

  public applyFiltersAndSort(): void {
    const searchQuery = this.getElement<HTMLInputElement>("#searchInput")?.value.toLowerCase() || "";
    const genreQuery = this.getElement<HTMLSelectElement>("#filterGenre")?.value.toLowerCase() || "";

    let filteredBooks = this.bookService.getBooks().filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery) || book.author.toLowerCase().includes(searchQuery);
      const matchesGenre = genreQuery ? book.genre.toLowerCase() === genreQuery : true;
      return matchesSearch && matchesGenre;
    });

    filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    this.renderFilteredBooks(filteredBooks);
  }

  private renderDeleteList(): void {
    const list = this.getElement<HTMLUListElement>('#deleteList');
    list.innerHTML = '';
    this.bookService.getBooks().forEach((book, i) => {
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

  public deleteBook(index: number): void {
    const deletedBook = this.bookService.deleteBook(index);
    this.logger.info(`Deleted book: "${deletedBook.title}"`);
    this.renderDeleteList();
    this.applyFiltersAndSort();
  }

  public editBook(index: number): void {
    const book = this.bookService.getBooks()[index];
    this.editingIndex = index;

    this.getElement<HTMLInputElement>('#title').value = book.title;
    this.getElement<HTMLInputElement>('#author').value = book.author;
    this.getElement<HTMLInputElement>('#isbn').value = book.isbn;
    this.getElement<HTMLInputElement>('#pubDate').value = book.pubDate;
    this.getElement<HTMLSelectElement>('#genre').value = book.genre;

    this.getElement<HTMLElement>('#formTitle').textContent = "Edit Book";
    this.getElement<HTMLButtonElement>('#submitBtn').textContent = "Save Changes";

    this.showPage('addBookPage');
  }

  private initEventListeners(): void {
    this.getElement<HTMLFormElement>('#bookForm').addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const title = this.getElement<HTMLInputElement>('#title').value.trim();
      const author = this.getElement<HTMLInputElement>('#author').value.trim();
      const isbn = this.getElement<HTMLInputElement>('#isbn').value.trim();
      const pubDate = this.getElement<HTMLInputElement>('#pubDate').value;
      const genre = this.getElement<HTMLSelectElement>('#genre').value.trim();

      if (!title || !author || !isbn || !pubDate || !genre) {
        this.logger.error("All fields must be filled out.");
        return alert('Fill all fields!');
      }
      if (isNaN(Number(isbn))) {
        this.logger.error("ISBN must be a numeric value.");
        return alert('ISBN must be numeric!');
      }

      const book: Book = {
        title,
        author,
        isbn,
        pubDate,
        genre,
        age: this.bookService.calculateAge(pubDate),
        category: this.bookService.categorizeGenre(genre)
      };

      if (this.editingIndex !== null) {
        this.bookService.updateBook(this.editingIndex, book);
        this.logger.success(`Book updated: "${book.title}"`);
        this.editingIndex = null;
        this.getElement<HTMLElement>('#formTitle').textContent = "Add a New Book";
        this.getElement<HTMLButtonElement>('#submitBtn').textContent = "Add Book";
      } else {
        this.bookService.addBook(book);
        this.logger.success(`New book added: "${book.title}"`);
      }

      (e.target as HTMLFormElement).reset();
      this.applyFiltersAndSort();
      this.showPage('viewBooksPage');
    });

    this.getElement<HTMLButtonElement>("#fetchApiBtn").addEventListener("click", () => this.app.loadBooksAsync());

    document.addEventListener("DOMContentLoaded", () => {
      this.getElement<HTMLSelectElement>("#filterGenre")?.addEventListener("change", () => this.applyFiltersAndSort());
      this.getElement<HTMLInputElement>("#searchInput")?.addEventListener("input", () => this.applyFiltersAndSort());
    });
  }
}