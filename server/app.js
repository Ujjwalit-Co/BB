import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import progressRoutes from './routes/progress.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import githubRoutes from './routes/github.routes.js';
import adminRoutes from './routes/admin.routes.js';
import creditRoutes from './routes/credit.routes.js';

// Import middleware
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/ping', (req, res) => {
  res.json({ message: 'BrainBazaar API is running!', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/progress', progressRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/github', githubRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/credits', creditRoutes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;
