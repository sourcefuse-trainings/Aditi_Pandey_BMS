import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { Button, Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChromaGridBookList from '../components/ChromaGridBookList';
import type { ChromaGridHandle } from '../components/ChromaGrid';

interface DeleteBookPageProps {
  books: Book[];
  deleteBook: (id: string) => void;
}

const DeleteBookPage: React.FC<DeleteBookPageProps> = ({ books, deleteBook }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const chromaGridRef = useRef<ChromaGridHandle>(null);

  const handleClickOpen = (book: Book) => {
    setBookToDelete(book);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setBookToDelete(null);
    chromaGridRef.current?.reFocus();
  };

  const handleDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
    }
    handleClose();
  };
  
  const renderDeleteAction = useCallback((book: Book) => (
    <Button
        size="small"
        color="error"
        onClick={() => handleClickOpen(book)}
        startIcon={<DeleteIcon />}
    >
        Delete
    </Button>
  ), []); // No dependencies needed as handleClickOpen is stable

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button onClick={() => navigate('/')} startIcon={<ArrowBackIcon />}>
          Back
        </Button>
      </Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Delete Books
        </Typography>
        <Typography color="text.secondary">
            Select a book from the list to permanently delete it.
        </Typography>
      </Box>
      <ChromaGridBookList
        ref={chromaGridRef}
        books={books}
        renderActions={renderDeleteAction}
      />
      <Dialog 
        open={dialogOpen} 
        onClose={handleClose}
        sx={{ zIndex: 1500 }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to permanently delete "{bookToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DeleteBookPage;