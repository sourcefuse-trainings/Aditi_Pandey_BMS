import React, { useState, useEffect } from 'react';
import type { Book } from './types';
import type { Page } from './types';
import { logger } from './utils/logger';

// Import Page Components
import PageAnimator from './components/PageAnimator';
import HomePage from './components/HomePage';
import AddBookPage from './components/AddBookPage';
import ViewBooksPage from './components/ViewBooksPage';
import DeleteBookPage from './components/DeleteBookPage';

const initialBooks: Book[] = [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', pubDate: '1925-04-10', genre: 'fiction' },
    { id: '2', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '9780553380163', pubDate: '1988-03-01', genre: 'science' }
];

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');
  const [books, setBooks] = useState<Book[]>(() => {
      const savedBooks = localStorage.getItem('books');
      return savedBooks ? JSON.parse(savedBooks) : initialBooks;
  });
  const [bookToEdit, setBookToEdit] = useState<Book | null>(null);

  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
    logger.info(`${books.length} books saved to localStorage.`);
  }, [books]);

  const addBook = (book: Book) => {
    setBooks(prev => [...prev, book]);
    logger.success(`Book added: "${book.title}"`);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => book.id === updatedBook.id ? updatedBook : book));
    setBookToEdit(null);
    logger.success(`Book updated: "${updatedBook.title}"`);
  };

  const deleteBook = (id: string) => {
    const bookToDelete = books.find(b => b.id === id);
    if(bookToDelete && window.confirm(`Are you sure you want to delete "${bookToDelete.title}"?`)) {
      setBooks(prev => prev.filter(book => book.id !== id));
      logger.info(`Book deleted: "${bookToDelete.title}"`);
    }
  };

  const addFetchedBooks = (fetchedBooks: Book[]) => {
    const newBooks = fetchedBooks.filter(
      fetchedBook => !books.some(existingBook => existingBook.title === fetchedBook.title)
    );
    setBooks(prevBooks => [...prevBooks, ...newBooks]);
    logger.success(`Added ${newBooks.length} new books from API.`);
  };

  const navigateToPage = (targetPage: Page) => {
      if (targetPage !== 'addBook') {
          setBookToEdit(null);
      }
      setPage(targetPage);
      logger.info(`Navigating to page: ${targetPage}`);
  };

  const renderPage = () => {
    switch (page) {
      case 'addBook':
        return <AddBookPage setPage={navigateToPage} addBook={addBook} updateBook={updateBook} bookToEdit={bookToEdit} />;
      case 'viewBooks':
        return <ViewBooksPage books={books} setPage={navigateToPage} setBookToEdit={setBookToEdit} onBooksFetched={addFetchedBooks} />;
      case 'deleteBook':
        return <DeleteBookPage books={books} setPage={navigateToPage} deleteBook={deleteBook} />;
      case 'home':
      default:
        return <HomePage setPage={navigateToPage} />;
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-text-primary overflow-x-hidden bg-gradient-body flex justify-center items-start p-8">
      <div className="fixed inset-0 z-[-1] animate-float
        bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2)_0%,transparent_50%)]"
      ></div>
      <PageAnimator>{renderPage()}</PageAnimator>
    </div>
  );
};

export default App;