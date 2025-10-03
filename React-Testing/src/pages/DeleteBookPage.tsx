import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { Button, Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// highlight-next-line
import ChromaGridBookList from '../components/ChromaGridBookList';

interface DeleteBookPageProps {
  books: Book[];
  deleteBook: (id: string) => void;
}

const DeleteBookPage: React.FC<DeleteBookPageProps> = ({ books, deleteBook }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  // The selectedBookId state is no longer needed here

  const handleClickOpen = (book: Book) => {
    setBookToDelete(book);
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setBookToDelete(null);
  };

  const handleDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
    }
    handleClose();
  };

  return (
    <Container maxWidth="lg">
      {/* The background overlay Box is no longer needed here */}
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

      {/* Replaced BookList with ChromaGridBookList */}
      {/* highlight-start */}
      <ChromaGridBookList
        books={books}
        renderActions={(book) => (
            <Button
                size="small"
                color="error"
                onClick={() => handleClickOpen(book)}
                startIcon={<DeleteIcon />}
            >
                Delete
            </Button>
        )}
      />
      {/* highlight-end */}
      
      <Dialog 
        open={dialogOpen} 
        onClose={handleClose}
        // zIndex ensures the dialog appears over the expanded card
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