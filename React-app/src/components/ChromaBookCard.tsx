// src/components/ChromaBookCard.tsx
import React from 'react';
import type { Book, Genre } from '../types';
import { calculateAge } from '../utils/bookUtils';
import { Box, Chip, Typography, Divider, CardActions } from '@mui/material';

const genreGradients: Record<Genre, { gradient: string; borderColor: string; }> = {
    fiction: { gradient: 'linear-gradient(145deg, #EF4444, #121212)', borderColor: '#EF4444' },
    science: { gradient: 'linear-gradient(145deg, #3B82F6, #121212)', borderColor: '#3B82F6' },
    history: { gradient: 'linear-gradient(145deg, #F59E0B, #121212)', borderColor: '#F59E0B' },
    biography: { gradient: 'linear-gradient(145deg, #8B5CF6, #121212)', borderColor: '#8B5CF6' },
    technology: { gradient: 'linear-gradient(145deg, #06B6D4, #121212)', borderColor: '#06B6D4' },
    romance: { gradient: 'linear-gradient(145deg, #EC4899, #121212)', borderColor: '#EC4899' },
    general: { gradient: 'linear-gradient(145deg, #6B7280, #121212)', borderColor: '#6B7280' }
};

interface ChromaBookCardProps {
    book: Book;
    isSelected: boolean;
    isDimmed: boolean;
    onClick: () => void;
    renderActions: () => React.ReactNode;
}

const ChromaBookCard: React.FC<ChromaBookCardProps> = ({ book, isSelected, isDimmed, onClick, renderActions }) => {
    
    const handleCardMove: React.MouseEventHandler<HTMLElement> = e => {
        const c = e.currentTarget as HTMLElement;
        const rect = c.getBoundingClientRect();
        c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };

    const { gradient, borderColor } = genreGradients[book.genre as Genre] || genreGradients.general;
    
    return (
        <article
            onClick={onClick}
            onMouseMove={handleCardMove}
            className={`group text-white w-full h-full cursor-pointer transition-all duration-300 ease-in-out ${isDimmed ? 'filter blur-md scale-95' : ''}`}
            style={{
                ...(isSelected && {
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'min(500px, 90vw)',
                    height: 'auto',
                    zIndex: 1400,
                    cursor: 'default'
                })
            }}
        >
            <Box 
                className="relative flex flex-col w-full h-full rounded-2xl overflow-hidden border-2"
                sx={{
                    transition: 'border-color 0.3s',
                    borderColor: isSelected ? borderColor : 'transparent',
                    background: gradient,
                }}
            >
                <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100"
                    style={{
                        background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.3), transparent 70%)'
                    }}
                />
                <Box className="relative z-10 flex flex-col flex-1 p-4">
                    <Box sx={{ minHeight: 60 }}>
                        <Typography variant="h6" className={`font-bold ${!isSelected ? 'truncate' : ''}`}>
                            {book.title}
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                            by {book.author}
                        </Typography>
                    </Box>
                    <Box sx={{
                        flexGrow: 1,
                        opacity: isSelected ? 1 : 0,
                        maxHeight: isSelected ? '500px' : '0px',
                        transform: isSelected ? 'translateY(0)' : 'translateY(10px)',
                        transition: 'all 0.4s ease-in-out 0.1s',
                        visibility: isSelected ? 'visible' : 'hidden'
                    }}>
                        <Divider sx={{ my: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Typography variant="body2">
                            <strong>ISBN:</strong> {book.isbn}
                        </Typography>
                        <Typography variant="body2">
                            <strong>Age:</strong> {calculateAge(book.pubDate)}
                        </Typography>
                    </Box>
                    <CardActions sx={{
                        justifyContent: 'space-between',
                        p: 0,
                        pt: 1,
                        opacity: isSelected ? 1 : 0,
                        transition: 'opacity 0.3s ease 0.1s',
                        visibility: isSelected ? 'visible' : 'hidden'
                    }}>
                        <Chip
                            label={book.genre.charAt(0).toUpperCase() + book.genre.slice(1)}
                            size="small"
                        />
                        <Box onClick={(e) => e.stopPropagation()}> 
                            {renderActions()}
                        </Box>
                    </CardActions>
                </Box>
            </Box>
        </article>
    );
};

export default ChromaBookCard;