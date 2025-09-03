// src/apiService.ts

import { Book } from 'interfaces';
import { BookService } from 'bookService';

export class ApiService {
  constructor(private readonly bookService: BookService) {}

  public async fetchExternalBooks(): Promise<Book[]> {
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
      age: this.bookService.calculateAge("2020-01-01"),
      category: "general"
    }));
  }
}