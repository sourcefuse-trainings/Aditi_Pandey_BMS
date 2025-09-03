// src/app.ts

import { Book } from 'interfaces';
import { BookService } from 'bookService';
import { ApiService } from 'apiService';
import { DOMService } from 'domService';
import { Logger } from 'logger';

export class App {
  private readonly bookService: BookService;
  private readonly apiService: ApiService;
  private readonly domService: DOMService;
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger();
    this.bookService = new BookService();
    this.apiService = new ApiService(this.bookService);
    this.domService = new DOMService(this.bookService, this.logger, this);
    this.logger.info("App initialized.");
  }

  public async loadBooksAsync(): Promise<void> {
    const loadingSpinner = document.querySelector<HTMLElement>("#loadingSpinner");
    const errorContainer = document.querySelector<HTMLElement>("#errorContainer");
    
    if (loadingSpinner) loadingSpinner.classList.remove("hidden");
    if (errorContainer) errorContainer.classList.add("hidden");
    
    try {
      const externalBooks = await this.apiService.fetchExternalBooks();
      externalBooks.forEach(book => this.bookService.addBook(book));
      this.logger.success(`Successfully fetched ${externalBooks.length} books from API.`);
      this.domService.applyFiltersAndSort();
    } catch (error: any) {
      this.logger.error("Failed to load books from API", error);
      if (errorContainer) {
        errorContainer.textContent = `Failed to load books: ${error.message}`;
        errorContainer.classList.remove("hidden");
      }
    } finally {
      if (loadingSpinner) loadingSpinner.classList.add("hidden");
    }
  }
}

new App();