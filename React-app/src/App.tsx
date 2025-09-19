import React, { useReducer, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import type { Book, AppState, Action } from './types';
import { logger } from './utils/logger';
import { bookService } from './services/bookService';
import PageAnimator from './components/PageAnimator';

// Lazily import page components
const HomePage = lazy(() => import('./components/HomePage'));
const AddBookPage = lazy(() => import('./components/AddBookPage'));
const ViewBooksPage = lazy(() => import('./components/ViewBooksPage'));
const DeleteBookPage = lazy(() => import('./components/DeleteBookPage'));

// The reducer is now simpler
const appReducer = (state: AppState, action: Action): AppState => {
  logger.info(`Action dispatched: ${action.type}`);
  switch (action.type) {
    case 'SET_BOOKS':
      return { ...state, books: action.payload };
    default:
      return state;
  }
};

// A simple component to show while pages are loading
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
  </div>
);

// This component contains the app's state logic and routes
const AppStateProvider: React.FC = () => {
  const initialState: AppState = {
    books: bookService.getBooks(),
  };

  const [state, dispatch] = useReducer(appReducer, initialState);
  const navigate = useNavigate();

  // Handler functions now use navigate for redirection
  const handleAddBook = (book: Omit<Book, 'id'>) => {
    const updatedBooks = bookService.addBook(book);
    dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
    navigate('/view');
  };

  const handleUpdateBook = (updatedBook: Book) => {
    const updatedBooks = bookService.updateBook(updatedBook);
    dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
    navigate('/view');
  };

  const handleDeleteBook = (id: string) => {
    const updatedBooks = bookService.deleteBook(id);
    if (updatedBooks) {
      dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
    }
  };

  const handleAddFetchedBooks = (fetchedBooks: Book[]) => {
    const updatedBooks = bookService.addFetchedBooks(state.books, fetchedBooks);
    dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
  };
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PageAnimator>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view" element={<ViewBooksPage books={state.books} onBooksFetched={handleAddFetchedBooks} />} />
          <Route path="/add" element={<AddBookPage books={state.books} addBook={handleAddBook} updateBook={handleUpdateBook} />} />
          <Route path="/edit/:bookId" element={<AddBookPage books={state.books} addBook={handleAddBook} updateBook={handleUpdateBook} />} />
          <Route path="/delete" element={<DeleteBookPage books={state.books} deleteBook={handleDeleteBook} />} />
        </Routes>
      </PageAnimator>
    </Suspense>
  );
};

// The main App component sets up the Router
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen font-sans text-text-primary overflow-x-hidden bg-gradient-body flex justify-center items-start p-8">
        <div className="fixed inset-0 z-[-1] animate-float
          bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.2)_0%,transparent_50%)]"
        ></div>
        <AppStateProvider />
      </div>
    </BrowserRouter>
  );
};

export default App;