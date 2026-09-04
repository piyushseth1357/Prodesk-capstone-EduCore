// Override DNS servers to bypass Windows/ISP DNS issues with MongoDB Atlas SRV lookup
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Silent fallback
}

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const courseRoutes = require('./routes/courseRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security & Parsing Middleware
app.use(cors());
app.use(express.json());

// RATE LIMITING THROTTLING (Sprint 16 Phase 3 P2)
// 1. Auth Rate Limiter: Max 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'fail',
    error: 'Too Many Requests',
    message: 'Too many login/registration attempts from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. AI Rate Limiter: Max 15 AI requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    status: 'fail',
    error: 'Too Many Requests',
    message: 'AI request limit reached for your session, please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// 3. General API Limiter: Max 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ai', aiLimiter, aiRoutes);

// Route Declarations
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/stripe', stripeRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'EduCore Secured Backend API is running safely (Sprint 16)' });
});

// Global Error Handling Middleware (Catches Mongoose CastError, Zod errors, 404 & 500)
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('MongoDB connected successfully to EduCore DB');
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port ${PORT}`);
  }
});