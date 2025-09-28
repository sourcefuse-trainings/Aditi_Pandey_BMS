import React from 'react';
import type { Book, Genre } from '../types';
import { Card, CardContent, Typography, CardActions, Chip, Box, Divider } from '@mui/material';
import { calculateAge } from '../utils/bookUtils';

const genreColorClasses: Record<Genre, "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"> = {
    fiction: "error",
    science: "primary",
    history: "warning",
    biography: "secondary",
    technology: "info",
    romance: "error",
    general: "default"
};

interface BookCardProps {
    book: Book;
    isSelected: boolean;
    isDimmed: boolean;
    renderActions: () => React.ReactNode;
}

const BookCard: React.FC<BookCardProps> = ({ book, isSelected, isDimmed, renderActions }) => {
    return (
        <Card
            sx={{
                // Base styles
                transition: 'all 0.35s ease-in-out',
                overflow: 'hidden',
                height: 120,
                p: 2,
                cursor: 'pointer',

                // Dimmed state
                ...(isDimmed && {
                    filter: 'blur(4px)',
                    transform: 'scale(0.98)',
                }),

                // Selected (expanded) state
                ...(isSelected && {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 450,
                    height: 300,
                    zIndex: 1400,
                    cursor: 'default',
                }),
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Always visible content */}
                <Box sx={{ minHeight: 60 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        by {book.author}
                    </Typography>
                </Box>

                {/* Content revealed on click */}
                <Box sx={{
                    flexGrow: 1,
                    opacity: isSelected ? 1 : 0,
                    transform: isSelected ? 'translateY(0)' : 'translateY(10px)',
                    transition: 'opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s',
                }}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary" display="block">
                        <strong>ISBN:</strong> {book.isbn}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" display="block">
                        <strong>Age:</strong> {calculateAge(book.pubDate)}
                    </Typography>
                </Box>

                {/* Actions revealed on click */}
                <CardActions sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 0,
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.3s ease 0.1s',
                }}>
                    <Chip
                        label={book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
                        color={genreColorClasses[book.genre as Genre] || 'default'}
                        size="small"
                    />
                    <Box onClick={(e) => e.stopPropagation()}> {/* Prevents card from closing when clicking buttons */}
                        {renderActions()}
                    </Box>
                </CardActions>
            </Box>
        </Card>
    );
};

export default BookCard;