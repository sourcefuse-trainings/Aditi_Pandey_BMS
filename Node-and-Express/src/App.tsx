import React, { useReducer, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import type { Book, AppState, Action } from './types';
import { logger } from './utils/logger';
import { bookService } from './services/bookService';
import { ThemeProvider, createTheme, CssBaseline, Container, CircularProgress, Box } from '@mui/material';

const HomePage = lazy(() => import('./pages/HomePage'));
const AddBookPage = lazy(() => import('./pages/AddBookPage'));
const ViewBooksPage = lazy(() => import('./pages/ViewBooksPage'));
const DeleteBookPage = lazy(() => import('./pages/DeleteBookPage'));

const customTheme = createTheme({

  palette: {

    mode: 'dark',

    primary: {

      main: '#6c63ff', // A nice, modern purple

    },

    background: {

      default: '#121212',

      paper: '#1e1e1e',

    },

  },

  typography: {

    fontFamily: 'Roboto, sans-serif',

    h1: {

      fontWeight: 700,

    },

    h2: {

      fontWeight: 700,

    },

    h4: {

        fontWeight: 700,

    }

  },

  components: {

    MuiButton: {

      styleOverrides: {

        root: {

          borderRadius: 8,

          textTransform: 'none',

          fontWeight: 600,

        },

      },

    },

    MuiTextField: {

        styleOverrides: {

            root: {

                '& .MuiOutlinedInput-root': {

                    borderRadius: 8,

                },

            },

        },

    },

    MuiCard: {

        styleOverrides: {

            root: {

                borderRadius: 12,

            }

        }

    }

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

const AppStateProvider: React.FC = () => {
    const initialState: AppState = { books: [] };
    const [state, dispatch] = useReducer(appReducer, initialState);
    const navigate = useNavigate();

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const booksFromApi = await bookService.getBooks();
                dispatch({ type: 'SET_BOOKS', payload: booksFromApi });
            } catch (error) {
                logger.error("Failed to load initial books", error);
            }
        };
        loadBooks();
    }, []);

    const handleAddBook = async (book: Omit<Book, 'id'>) => {
        await bookService.addBook(book);
        const updatedBooks = await bookService.getBooks();
        dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
        navigate('/view');
    };

    const handleUpdateBook = async (updatedBook: Book) => {
        await bookService.updateBook(updatedBook);
        const updatedBooks = await bookService.getBooks();
        dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
        navigate('/view');
    };

    const handleDeleteBook = async (id: string) => {
        await bookService.deleteBook(id);
        const updatedBooks = await bookService.getBooks();
        dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
    };

    const handleAddFetchedBooks = async () => {
        const updatedBooks = await bookService.fetchBooksFromApi();
        dispatch({ type: 'SET_BOOKS', payload: updatedBooks });
    };

    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/view" element={<ViewBooksPage books={state.books} onBooksFetched={handleAddFetchedBooks} />} />
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