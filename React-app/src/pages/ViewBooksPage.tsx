import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { genres } from '../types';
import { logger } from '../utils/logger';
import { bookService } from '../services/bookService';
import BookList from '../components/BookList';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ViewBooksPage: React.FC<{
  books: Book[];
  onBooksFetched: (books: Book[]) => void;
}> = ({ books, onBooksFetched }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books
      .filter(book =>
        (book.title.toLowerCase().includes(search.toLowerCase()) ||
         book.author.toLowerCase().includes(search.toLowerCase())) &&
        (filter ? book.genre === filter : true)
      )
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [books, search, filter]);

  const handleEdit = (bookId: string) => {
    navigate(`/edit/${bookId}`);
  };

  const fetchFromApi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBooks = await bookService.fetchBooksFromApi();
      onBooksFetched(fetchedBooks);
    } catch (err: any) {
      logger.error("Failed to fetch books from API", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        onClick={() => setSelectedBookId(null)} // Click outside to close
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          opacity: selectedBookId ? 1 : 0,
          visibility: selectedBookId ? 'visible' : 'hidden',
          zIndex: 1399,
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
      />
      <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Book List
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2, justifyContent: 'center' }}>
        <TextField
          label="Search by title or author"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 500 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Genre</InputLabel>
          <Select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            label="Genre"
          >
            <MenuItem value="">
              <em>All Genres</em>
            </MenuItem>
            {genres.map(g => (
              <MenuItem key={g} value={g}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button onClick={fetchFromApi} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Fetch from API'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <BookList
        books={filteredBooks}
        selectedBookId={selectedBookId}
        setSelectedBookId={setSelectedBookId}
        renderActions={(book) => (
            <Button
                size="small"
                onClick={() => handleEdit(book.id)}
                startIcon={<EditIcon />}
            >
                Edit
            </Button>
        )}
      />
    </Container>
  );
};

export default ViewBooksPage;