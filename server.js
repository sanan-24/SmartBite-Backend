const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/foods', require('./routes/food'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/users', require('./routes/user'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/riders', require('./routes/rider'));
app.use('/api/payment', require('./routes/payment'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Delivery API is running'
  });
});

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
