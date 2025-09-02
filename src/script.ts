// src/script.ts

// ===================================
// 1. INTERFACES & TYPE DEFINITIONS
// ===================================
interface Book {
  title: string;
  author: string;
  isbn: string;
  pubDate: string;
  genre: string;
  age: string;
  category: string;
}

type CustomWindow = Window & typeof globalThis & {
  editBook: (index: number) => void;
  deleteBook: (index: number) => void;
  showPage: (pageId: string) => void;
};


// ===================================
// 2. SIMPLIFIED LOGGER CLASS
// ===================================
class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private colorize(message: string, color: string): [string, string] {
    const css = `color: ${color}; font-weight: bold;`;
    const plainText = `[${this.getTimestamp()}] ${message}`;
    return [plainText, css];
  }

  public info(message: string): void {
    const [plainText, css] = this.colorize(`INFO: ${message}`, 'deepskyblue');
    console.log(`%c${plainText}`, css);
  }
  
  public success(message: string): void {
    const [plainText, css] = this.colorize(`SUCCESS: ${message}`, 'mediumseagreen');
    console.log(`%c${plainText}`, css);
  }

  public error(message: string, errorObj?: any): void {
    const errorMessage = errorObj ? `${message} - ${errorObj.message}` : message;
    const [plainText, css] = this.colorize(`ERROR: ${errorMessage}`, 'crimson');
    console.error(`%c${plainText}`, css);
  }
}


// ===================================
// 3. DECORATOR
// ===================================
function LogMethodActivity(logger: Logger) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      logger.info(`Calling method: ${propertyKey}`);
      const result = originalMethod.apply(this, args);
      logger.info(`Method ${propertyKey} finished execution.`);
      return result;
    };
    return descriptor;
  }
}


// ===================================
// 4. BOOK MANAGER CLASS
// ===================================
class BookManager {
  private books: Book[] = [];
  private editingIndex: number | null = null;
  private readonly logger = new Logger();

  constructor() {
    this.initEventListeners();
    this.attachMethodsToWindow();
    this.logger.info("BookManager initialized.");
  }
  
  // ... (All other methods remain the same, but the download-related code is removed) ...

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
  
  private calculateAge(pubDate: string): string {
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
  
  private categorizeGenre(genre: string): string {
    const categories: { [key: string]: string } = {
      fiction: 'Entertainment',
      science: 'Educational',
      history: 'Informational',
      biography: 'Inspirational',
      technology: 'Technical',
      romance: 'Emotional'
    };
    return categories[genre.toLowerCase()] || 'General';
  }

  private renderFilteredBooks(filteredBooks: Book[]): void {
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

  @LogMethodActivity(new Logger())
  public applyFiltersAndSort(): void {
    const searchQuery = this.getElement<HTMLInputElement>("#searchInput")?.value.toLowerCase() || "";
    const genreQuery = this.getElement<HTMLSelectElement>("#filterGenre")?.value.toLowerCase() || "";
  
    let filteredBooks = this.books.filter(book => {
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

  public deleteBook(index: number): void {
    const deletedBook = this.books[index];
    this.books.splice(index, 1);
    this.logger.info(`Deleted book: "${deletedBook.title}"`);
    this.renderDeleteList();
    this.applyFiltersAndSort();
  }

  public editBook(index: number): void {
    const book = this.books[index];
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

  private async fetchExternalBooks(): Promise<Book[]> {
    const url = `https://jsonplaceholder.typicode.com/posts?_limit=3&_=${Date.now()}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
    const data = await response.json();
    return data.map((post: any): Book => ({
      title: post.title,
      author: `User ${post.userId}`,
      isbn: `123${post.id}`,
      pubDate: "2020-01-01",
      genre: "general",
      age: this.calculateAge("2020-01-01"),
      category: "general"
    }));
  }

  @LogMethodActivity(new Logger())
  private async loadBooksAsync(): Promise<void> {
    const loadingSpinner = this.getElement<HTMLElement>("#loadingSpinner");
    const errorContainer = this.getElement<HTMLElement>("#errorContainer");
    
    loadingSpinner.classList.remove("hidden");
    errorContainer.classList.add("hidden");
    
    try {
      const externalBooks = await this.fetchExternalBooks();
      this.books.push(...externalBooks);
      this.logger.success(`Successfully fetched ${externalBooks.length} books from API.`);
      this.applyFiltersAndSort();
    } catch (error: any) {
      this.logger.error("Failed to load books from API", error);
      errorContainer.textContent = `Failed to load books: ${error.message}`;
      errorContainer.classList.remove("hidden");
    } finally {
      loadingSpinner.classList.add("hidden");
    }
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

      const book: Book = { title, author, isbn, pubDate, genre, age: this.calculateAge(pubDate), category: this.categorizeGenre(genre) };
      
      if (this.editingIndex !== null) {
        this.books[this.editingIndex] = book;
        this.logger.success(`Book updated: "${book.title}"`);
        this.editingIndex = null;
        this.getElement<HTMLElement>('#formTitle').textContent = "Add a New Book";
        this.getElement<HTMLButtonElement>('#submitBtn').textContent = "Add Book";
      } else {
        this.books.push(book);
        this.logger.success(`New book added: "${book.title}"`);
      }
      
      (e.target as HTMLFormElement).reset();
      this.applyFiltersAndSort();
      this.showPage('viewBooksPage');
    });

    this.getElement<HTMLButtonElement>("#fetchApiBtn").addEventListener("click", () => this.loadBooksAsync());

    document.addEventListener("DOMContentLoaded", () => {
      this.getElement<HTMLSelectElement>("#filterGenre")?.addEventListener("change", () => this.applyFiltersAndSort());
      this.getElement<HTMLInputElement>("#searchInput")?.addEventListener("input", () => this.applyFiltersAndSort());
    });
  }
}

// ===================================
// 5. APP INITIALIZATION
// ===================================
new BookManager();