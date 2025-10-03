import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import BookForm from '../components/BookForm';
import { Container, Typography, Button } from '@mui/material';

interface AddBookPageProps {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (book: Book) => void;
}

const AddBookPage: React.FC<AddBookPageProps> = ({ books, addBook, updateBook }) => {
  const navigate = useNavigate();
  const isEditing = window.location.pathname.includes('edit');

  return (
    <Container maxWidth="sm">
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ⬅ Back
      </Button>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {isEditing ? 'Edit Book' : 'Add a New Book'}
      </Typography>
      <BookForm books={books} addBook={addBook} updateBook={updateBook} />
    </Container>
  );
};

export default AddBookPage;