const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://smart-seat-silk.vercel.app',
];
if (process.env.CLIENT_URL) {
  const clientUrls = process.env.CLIENT_URL.split(',').map((url) => url.trim());
  clientUrls.forEach((url) => {
    if (!allowedOrigins.includes(url)) {
      allowedOrigins.push(url);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  // Join branch room for real-time table updates
  socket.on('join_branch', (branchId) => {
    socket.join(`branch_${branchId}`);
    console.log(`Socket joined branch room: ${branchId}`);
  });

  socket.on('leave_branch', (branchId) => {
    socket.leave(`branch_${branchId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
const { globalLimiter } = require('./middleware/rateLimiter');
app.use('/api', globalLimiter);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/tables', require('./routes/tableRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/waitlist', require('./routes/waitlistRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Root route (Render health probes)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSeat API is running',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SmartSeat API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be after routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`\n🪑 SmartSeat API running on port ${PORT}`);
  console.log(`   Environment: ${env}`);
  console.log(`   Health check: ${baseUrl}/api/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
