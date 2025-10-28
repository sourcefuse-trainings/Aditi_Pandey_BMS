// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faBookOpen, faListCheck } from '@fortawesome/free-solid-svg-icons';
import { Card, CardActionArea, CardContent, Typography, Grid, Container, Box } from '@mui/material';

const MenuCard: React.FC<{ icon: any; text: string; onClick: () => void }> = ({ icon, text, onClick }) => (
    // FIX: Added 'item' and responsive props
    <Grid item xs={12} sm={6} md={4}> 
        <CardActionArea component="div" onClick={onClick} sx={{ height: '100%', borderRadius: 3 }}>
            <Card sx={{
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                }
            }}>
                <CardContent sx={{ textAlign: 'center' }}>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: '3rem', marginBottom: '1rem' }} />
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 600 }}>
                        {text}
                    </Typography>
                </CardContent>
            </Card>
        </CardActionArea>
    </Grid>
);

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', my: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom>
                    📖 Book Management System
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Your personal library at your fingertips.
                </Typography>
            </Box>
            <Grid container spacing={4} justifyContent="center">
                <MenuCard icon={faPlusCircle} text="Add New Book" onClick={() => navigate('/add')} />
                <MenuCard icon={faBookOpen} text="View All Books" onClick={() => navigate('/view')} />
                <MenuCard icon={faListCheck} text="Manage Books" onClick={() => navigate('/delete')} />
            </Grid>
        </Container>
    );
};

export default HomePage;