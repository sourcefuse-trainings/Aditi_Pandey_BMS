// src/bookService.ts

import { Book } from 'interfaces';

export class BookService {
  private books: Book[] = [];

  public getBooks(): Book[] {
    return this.books;
  }

  public addBook(book: Book): void {
    this.books.push(book);
  }

  public updateBook(index: number, book: Book): void {
    this.books[index] = book;
  }

  public deleteBook(index: number): Book {
    const deletedBook = this.books[index];
    this.books.splice(index, 1);
    return deletedBook;
  }

  public calculateAge(pubDate: string): string {
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

  public categorizeGenre(genre: string): string {
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
}