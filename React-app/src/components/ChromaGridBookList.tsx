// src/components/ChromaGridBookList.tsx
import React, { useState, forwardRef } from 'react';
import type { Book } from '../types';
import { Typography, Box } from '@mui/material';
import ChromaGrid, { type ChromaGridHandle } from './ChromaGrid';
import ChromaBookCard from './ChromaBookCard';

interface BookListProps {
    books: Book[];
    renderActions: (book: Book) => React.ReactNode;
}

const ChromaGridBookList = forwardRef<ChromaGridHandle, BookListProps>(({ books, renderActions }, ref) => {
    const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

    if (books.length === 0) {
        return (
            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No books to display.
            </Typography>
        );
    }

    return (
        <>
            <Box
                onClick={() => setSelectedBookId(null)} 
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    opacity: selectedBookId ? 1 : 0,
                    visibility: selectedBookId ? 'visible' : 'hidden',
                    zIndex: 1399,
                    transition: 'opacity 0.3s ease, visibility 0.3s ease',
                }}
            />
            <ChromaGrid<Book>
                ref={ref}
                items={books}
                renderItem={(book) => ( // The type of 'book' is now correctly inferred as Book
                    <div key={book.id} className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.33%-0.66rem)] h-40">
                        <ChromaBookCard
                            book={book}
                            isSelected={selectedBookId === book.id}
                            isDimmed={selectedBookId !== null && selectedBookId !== book.id}
                            onClick={() => setSelectedBookId(prevId => prevId === book.id ? null : book.id)}
                            renderActions={() => renderActions(book)}
                        />
                    </div>
                )}
            />
        </>
    );
});

export default ChromaGridBookList;