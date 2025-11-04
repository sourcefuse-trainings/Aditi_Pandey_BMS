// src/components/BookForm.tsx
import React, { useState, useEffect, useMemo } from 'react';
// highlight-next-line
import { useParams, useNavigate } from 'react-router-dom';
import { type Book, genres } from '../types';
import { logger } from '../utils/logger';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, type SelectChangeEvent, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface BookFormProps {
  books: Book[];
  // highlight-start
  // Props are now async functions
  addBook: (book: Omit<Book, 'id'>) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  // highlight-end
}

const initialFormData = {
  title: '', author: '', isbn: '', pubDate: '', genre: ''
};

const BookForm: React.FC<BookFormProps> = ({ books, addBook, updateBook }) => {
  
  const { bookId } = useParams<{ bookId: string }>();
  // highlight-start
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // highlight-end

  const [formData, setFormData] = useState(initialFormData);
  const [publicationDate, setPublicationDate] = useState<Date | null>(null);

  const bookToEdit = useMemo(() =>
    bookId ? books.find(b => b.id === bookId) : null,
    [bookId, books]
  );

  const isEditing = !!bookToEdit;

  useEffect(() => {
    if (isEditing && bookToEdit) {
      setFormData({
        title: bookToEdit.title,
        author: bookToEdit.author,
        isbn: bookToEdit.isbn,
        pubDate: bookToEdit.pubDate,
        genre: bookToEdit.genre,
      });
      // Ensure pubDate is a valid date object
      setPublicationDate(new Date(bookToEdit.pubDate));
      logger.info(`Editing book: ${bookToEdit.title}`);
    } else {
      setFormData(initialFormData);
      setPublicationDate(null);
    }
  }, [bookToEdit, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setPublicationDate(date);
      setFormData(prev => ({ ...prev, pubDate: date.toISOString().split('T')[0] }));
    }
  };

  // highlight-start
  // Handle submit is now async
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isEditing && bookToEdit) {
        await updateBook({ ...bookToEdit, ...formData });
      } else {
        await addBook(formData);
      }
      // On success, navigate back to the home page
      navigate('/');
    } catch (error) {
      // Error is already logged and alerted by the service
      logger.error('Form submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // highlight-end

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={2}>
          {/* highlight-start */}
          {/* FIX: Added 'item' and responsive 'xs'/'sm' props */}
          <Grid item xs={12} sm={6}>
          {/* highlight-end */}
            <TextField
              name="title"
              required
              fullWidth
              id="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          {/* highlight-start */}
          <Grid item xs={12} sm={6}>
          {/* highlight-end */}
            <TextField
              name="author"
              required
              fullWidth
              id="author"
              label="Author"
              value={formData.author}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          {/* highlight-start */}
          <Grid item xs={12} sm={6}>
          {/* highlight-end */}
            <TextField
              name="isbn"
              required
              fullWidth
              id="isbn"
              label="ISBN"
              value={formData.isbn}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Grid>
          {/* highlight-start */}
          <Grid item xs={12} sm={6}>
          {/* highlight-end */}
            <DatePicker
              label="Publication Date"
              value={publicationDate}
              onChange={handleDateChange}
              disabled={isSubmitting}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            {/* highlight-end */}
          </Grid>
          {/* highlight-start */}
          <Grid item xs={12}>
          {/* highlight-end */}
            <FormControl fullWidth required>
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                id="genre"
                name="genre"
                value={formData.genre}
                label="Genre"
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <MenuItem value="">
                  <em>Select Genre</em>
                </MenuItem>
                {genres.map(g => (
                  <MenuItem key={g} value={g}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          // highlight-start
          disabled={isSubmitting}
          // highlight-end
        >
          {/* highlight-start */}
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Save Changes' : 'Add Book')}
          {/* highlight-end */}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default BookForm;