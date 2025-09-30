import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import BookList from '../components/BookList';
import { Button, Container, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface DeleteBookPageProps {
  books: Book[];
  deleteBook: (id: string) => void;
}

const DeleteBookPage: React.FC<DeleteBookPageProps> = ({ books, deleteBook }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const handleClickOpen = (book: Book) => {
    setBookToDelete(book);
    setDialogOpen(true);
    // CHANGE 1: Close the enlarged card view when the dialog opens for a cleaner UI.
    setSelectedBookId(null);
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

      <BookList
        books={books}
        selectedBookId={selectedBookId}
        setSelectedBookId={setSelectedBookId}
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
      
      <Dialog 
        open={dialogOpen} 
        onClose={handleClose}
        // CHANGE 2: Set a higher z-index to ensure the dialog appears on top of the overlay.
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