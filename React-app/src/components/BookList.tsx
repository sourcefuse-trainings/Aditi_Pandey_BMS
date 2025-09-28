import React from 'react';
import type { Book } from '../types';
import { Grid, Typography } from '@mui/material';
import BookCard from './BookCard';

interface BookListProps {
    books: Book[];
    selectedBookId: string | null;
    setSelectedBookId: (id: string | null) => void;
    renderActions: (book: Book) => React.ReactNode;
}

const BookList: React.FC<BookListProps> = ({ books, selectedBookId, setSelectedBookId, renderActions }) => {
    if (books.length === 0) {
        return (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No books to display.
            </Typography>
        );
    }

    return (
        <Grid container spacing={3} sx={{ mt: 2 }}>
            {books.map(book => (
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={book.id}
                    sx={{ minWidth: 0 }}
                    onClick={() => setSelectedBookId(prevId => prevId === book.id ? null : book.id)}
                >
                    <BookCard
                        book={book}
                        isSelected={selectedBookId === book.id}
                        isDimmed={selectedBookId !== null && selectedBookId !== book.id}
                        renderActions={() => renderActions(book)}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default BookList;