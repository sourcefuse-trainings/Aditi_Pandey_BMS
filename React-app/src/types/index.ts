export interface Book {
  id: string; // Use a unique ID for React keys
  title: string;
  author: string;
  isbn: string;
  pubDate: string;
  genre: string;
  age?: string; // Optional as it can be calculated
  category?: string; // Optional as it's derived
}

// Defines the possible pages in our application for type-safe navigation
export type Page = "home" | "addBook" | "viewBooks" | "deleteBook";

// Defines the available genres for the form dropdown
export const genres = [
  "fiction", "science", "history", "biography", "technology", "romance", "general"
] as const;

export type Genre = typeof genres[number];