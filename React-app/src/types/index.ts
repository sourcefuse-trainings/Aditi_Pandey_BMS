export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  pubDate: string;
  genre: string;
}

export const genres = [
  "fiction", "science", "history", "biography", "technology", "romance", "general"
] as const;

export type Genre = typeof genres[number];

// AppState no longer needs to track the page
export interface AppState {
  books: Book[];
}

// Actions are simplified as routing is handled separately
export type Action =
  | { type: 'SET_BOOKS'; payload: Book[] };