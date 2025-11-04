// src/App.tsx
import React, { useReducer, lazy, Suspense, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { Book, AppState, Action } from './types';
import { logger } from './utils/logger';
import { bookService } from './services/bookService';
import { ThemeProvider, createTheme, CssBaseline, Container, CircularProgress, Box, Alert } from '@mui/material';

// Lazily import page components
const HomePage = lazy(() => import('./pages/HomePage'));
const AddBookPage = lazy(() => import('./pages/AddBookPage'));
const ViewBooksPage = lazy(() => import('./pages/ViewBooksPage'));
const DeleteBookPage = lazy(() => import('./pages/DeleteBookPage'));

// Define our custom theme
const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6c63ff' },
    background: { default: '#121212', paper: '#1e1e1e' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h4: { fontWeight: 700 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 }}},
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 }}}},
    MuiCard: { styleOverrides: { root: { borderRadius: 12 }}}
  },
});

const appReducer = (state: AppState, action: Action): AppState => {
    logger.info(`Action dispatched: ${action.type}`);
    switch (action.type) {
      case 'SET_BOOKS':
        return { ...state, books: action.payload };
      default:
        return state;
    }
};

const LoadingFallback: React.FC = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
    </Box>
);

// This component now holds all state and logic
const AppStateProvider: React.FC = () => {
    const initialState: AppState = {
      books: [], // Start with an empty array
    };
  
    const [state, dispatch] = useReducer(appReducer, initialState);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
  
    // Use useCallback to memoize this function
    const loadBooks = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const booksFromDb = await bookService.getBooks();
            dispatch({ type: 'SET_BOOKS', payload: booksFromDb });
        } catch (err) {
            setError("Failed to connect to the server. Please ensure the backend is running.");
            logger.error("Failed to load books", err);
        } finally {
            setIsLoading(false);
        }
    }, []); // Empty dependency array means this function is created only once

    // Fetch initial data on component mount
    useEffect(() => {
        loadBooks();
    }, [loadBooks]);

    // All handlers are now async and re-fetch data for consistency
    const handleAddBook = async (book: Omit<Book, 'id'>) => {
      const newBook = await bookService.addBook(book);
      if (newBook) {
        await loadBooks(); // Re-fetch the list to include the new book
      }
    };
  
    const handleUpdateBook = async (updatedBook: Book) => {
      const result = await bookService.updateBook(updatedBook);
      if (result) {
        await loadBooks(); // Re-fetch the list to show changes
      }
    };
  
    const handleDeleteBook = async (id: string) => {
      const success = await bookService.deleteBook(id);
      if (success) {
        await loadBooks(); // Re-fetch the list to remove the deleted book
      }
    };
  
    if (isLoading) {
        return <LoadingFallback />;
    }

    if (error) {
        return <Alert severity="error" sx={{mt: 4}}>{error}</Alert>;
    }
  
    return (
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/view" element={<ViewBooksPage books={state.books} reloadBooks={loadBooks} />} />
          <Route path="/add" element={<AddBookPage books={state.books} addBook={handleAddBook} updateBook={handleUpdateBook} />} />
          <Route path="/edit/:bookId" element={<AddBookPage books={state.books} addBook={handleAddBook} updateBook={handleUpdateBook} />} />
          <Route path="/delete" element={<DeleteBookPage books={state.books} deleteBook={handleDeleteBook} />} />
        </Routes>
      </Suspense>
    );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Container component="main" sx={{ py: 4 }}>
          <AppStateProvider />
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;