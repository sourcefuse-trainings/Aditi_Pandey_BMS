// src/pages/ViewBooksPage.tsx
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { genres } from '../types';
import { logger } from '../utils/logger';
import { bookService } from '../services/bookService';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChromaGridBookList from '../components/ChromaGridBookList';

const ViewBooksPage: React.FC<{
  books: Book[];
  reloadBooks: () => Promise<void>; // Prop to tell parent to re-fetch
}> = ({ books, reloadBooks }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return books
      .filter(book =>
        (book.title.toLowerCase().includes(search.toLowerCase()) ||
         book.author.toLowerCase().includes(search.toLowerCase())) &&
        (filter ? book.genre === filter : true)
      )
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()); // Sort by most recent
  }, [books, search, filter]);

  const handleEdit = (bookId: string) => {
    navigate(`/edit/${bookId}`);
  };

  const fetchFromApi = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedBooks = await bookService.fetchBooksFromApi();
      if (fetchedBooks.length > 0) {
        // Add each fetched book to our database via the service
        for (const book of fetchedBooks) {
            // We don't need to await each one if we don't care about sequential adding
            bookService.addBook(book);
        }
        await reloadBooks(); // After adding, reload the main list
      }
    } catch (err: any) {
      logger.error("Failed to fetch books from API", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Book List
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <TextField
          label="Search by title or author"
          variant="outlined"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ flexGrow: 1, maxWidth: 500 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 150 }}>
          <InputLabel>Genre</InputLabel>
          <Select value={filter} onChange={e => setFilter(e.target.value)} label="Genre">
            <MenuItem value=""><em>All Genres</em></MenuItem>
            {genres.map(g => ( <MenuItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</MenuItem>))}
          </Select>
        </FormControl>
        <Button onClick={fetchFromApi} variant="contained" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} /> : 'Fetch New Books'}
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <ChromaGridBookList
        books={filteredBooks}
        renderActions={(book) => (
            <Button size="small" onClick={() => handleEdit(book.id)} startIcon={<EditIcon />}>
                Edit
            </Button>
        )}
      />
      {/* highlight-end */}
    </Container>
  );
};

export default ViewBooksPage;