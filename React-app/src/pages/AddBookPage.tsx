// src/pages/AddBookPage.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Book } from '../types';
import BookForm from '../components/BookForm';
import { Container, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface AddBookPageProps {
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => Promise<void>; // Prop is now async
  updateBook: (book: Book) => Promise<void>; // Prop is now async
}

const AddBookPage: React.FC<AddBookPageProps> = ({ books, addBook, updateBook }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname.includes('edit');

  return (
    <Container>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
            Back
        </Button>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {isEditing ? 'Edit Book Details' : 'Add a New Book'}
      </Typography>
      <BookForm books={books} addBook={addBook} updateBook={updateBook} />
    </Container>
  );
};

export default AddBookPage;