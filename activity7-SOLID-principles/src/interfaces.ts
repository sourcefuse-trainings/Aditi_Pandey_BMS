// src/interfaces.ts

export interface Book {
  title: string;
  author: string;
  isbn: string;
  pubDate: string;
  genre: string;
  age: string;
  category: string;
}

export type CustomWindow = Window & typeof globalThis & {
  editBook: (index: number) => void;
  deleteBook: (index: number) => void;
  showPage: (pageId: string) => void;
};