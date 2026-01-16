const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const institutionMiddleware = require('./middleware/institutionMiddleware');

const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Setup Cron Jobs
const setupCronJobs = require('./utils/cronJobs');
setupCronJobs();

const app = express();

const cookieParser = require('cookie-parser');

// ... imports

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Allow cookies
}));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(cookieParser()); // Parse cookies
app.use(mongoSanitize());
app.use(hpp());


const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Increased for dev
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased for dev
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// Routes
const authRoutes = require('./routes/authRoutes');
const tenantAuthRoutes = require('./routes/tenantAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clubRoutes = require('./routes/clubRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');

// Global Auth Routes (Institution Registration)
// Apply stricter limit to auth routes
app.use('/api', authRoutes); // Removed authLimiter from global mapping to avoid conflicts, or apply intentionally to specific routes if needed. For now simplest is relaxed.

// Multi-tenant Routes
// Apply institution middleware to all routes starting with /api/:institutionCode
app.use('/api/:institutionCode', institutionMiddleware);

// Mount routes
app.use('/api/:institutionCode/auth', tenantAuthRoutes);
app.use('/api/:institutionCode/admin', adminRoutes);
app.use('/api/:institutionCode/clubs', clubRoutes);
app.use('/api/:institutionCode/events', eventRoutes);
app.use('/api/:institutionCode/me', userRoutes);

const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// 404 Handler
app.use(notFound);

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
