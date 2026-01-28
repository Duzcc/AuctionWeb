import './config/env.js'; // MUST BE FIRST
import express from 'express';
import { createServer } from 'http';
// dotenv is now loaded in ./config/env.js
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import plateRoutes from './routes/plate.routes.js';
import sessionRoutes from './routes/session.routes.js';
import roomRoutes from './routes/room.routes.js';
import favoriteRoutes from './routes/favorite.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import bidRoutes from './routes/bid.routes.js';
import adminRoutes from './routes/admin.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import kycRoutes from './routes/kyc.routes.js';
import { initializeSocket } from './socket/socket.handler.js';
import auctionCron from './jobs/auctionCron.js';

// Load environment variables via ./config/env.js imported at top

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Middleware
// Support multiple frontend instances
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plates', plateRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/kyc', kycRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error Stack:', err);

    let error = { ...err };
    error.message = err.message;

    // Mongoose Bad ObjectId
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        error = new Error(message);
        error.status = 404;
    }

    // Mongoose Duplicate Key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        error.status = 400;
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new Error(message);
        error.status = 400;
    }

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize Socket.io
        initializeSocket(httpServer);

        // Start auction cron jobs
        console.log('🕐 Starting auction cron jobs...');
        auctionCron.startAll();

        // Start HTTP server
        httpServer.listen(PORT, () => {
            console.log('\n' + '='.repeat(50));
            console.log('🚀 SERVER STARTED SUCCESSFULLY');
            console.log('='.repeat(50));
            console.log(`📍 Port: ${PORT}`);
            console.log(`📡 WebSocket: Ready`);
            console.log(`⏰ Cron Jobs: Active`);
            console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
            console.log('='.repeat(50) + '\n');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    httpServer.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
    console.log('\\n👋 SIGTERM received, shutting down gracefully');
    auctionCron.stopAll();
    httpServer.close(() => {
        console.log('✅ Process terminated');
    });
});

// Start the server
startServer();

export default app;
