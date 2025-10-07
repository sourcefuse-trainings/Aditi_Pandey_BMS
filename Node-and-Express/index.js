import express from 'express';
import cors from 'cors'; // 👈 Import cors
import bookRoutes from './routes/bookRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---

app.use(cors()); // 👈 Enable CORS for all routes
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Routes ---
app.use('/api/books', bookRoutes);

// --- Error Handling & Server Start ---
// (The rest of the file remains the same)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
