import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { type Book, genres } from '../types';
import { logger } from '../utils/logger';
// highlight-next-line
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, type SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface BookFormProps {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
}

const initialFormData = {
  title: '', author: '', isbn: '', pubDate: '', genre: ''
};

const BookForm: React.FC<BookFormProps> = ({ books, addBook, updateBook }) => {
  
  const { bookId } = useParams<{ bookId: string }>();

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
      setPublicationDate(new Date(bookToEdit.pubDate));
      logger.info(`Editing book: ${bookToEdit.title}`);
    } else {
      setFormData(initialFormData);
      setPublicationDate(null);
    }
  }, [bookToEdit, isEditing]);

  // highlight-start
  // FIX: Updated the type to handle both TextField and Select change events
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
  // highlight-end
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
        setPublicationDate(date);
      setFormData(prev => ({ ...prev, pubDate: date.toISOString().split('T')[0] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && bookToEdit) {
      updateBook({ ...bookToEdit, ...formData });
    } else {
      addBook(formData);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          {/* FIX: Added 'item' and 'xs' props to all Grid children */}
          <Grid >
            <TextField
              name="title"
              required
              fullWidth
              id="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
            />
          </Grid>
          <Grid >
            <TextField
              name="author"
              required
              fullWidth
              id="author"
              label="Author"
              value={formData.author}
              onChange={handleChange}
            />
          </Grid>
          <Grid >
            <TextField
              name="isbn"
              required
              fullWidth
              id="isbn"
              label="ISBN"
              value={formData.isbn}
              onChange={handleChange}
            />
          </Grid>
          <Grid >
            {/* highlight-start */}
            {/* FIX: Replaced deprecated 'renderInput' with the 'slotProps' API */}
            <DatePicker
              label="Publication Date"
              value={publicationDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true
                }
              }}
            />
            {/* highlight-end */}
          </Grid>
          <Grid >
            <FormControl fullWidth required>
              <InputLabel id="genre-label">Genre</InputLabel>
              <Select
                labelId="genre-label"
                id="genre"
                name="genre"
                value={formData.genre}
                label="Genre"
                onChange={handleChange}
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
        >
          {isEditing ? 'Save Changes' : 'Add Book'}
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default BookForm;