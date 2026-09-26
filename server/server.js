import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import actionItemsRoutes from './routes/actionItems.js';
import dashboardRoutes from './routes/dashboard.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initDb } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev/testing
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'NoteFlow AI API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/action-items', actionItemsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚀 NoteFlow AI Server running on port ${PORT}`);
  console.log(`=========================================`);
  await initDb();
});
