const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// DATABASE CONNECTION
const connectDB = require('./db/db');
connectDB();

// ROUTES
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const mapsRoutes = require('./routes/maps.routes');
const rideRoutes = require('./routes/ride.routes');
const authRoutes = require('./routes/auth.routes');

// ======================
// MIDDLEWARES
// ======================

// CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://your-frontend-url.vercel.app'
    ],
    credentials: true
  })
);

// JSON Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Static Upload Folder
app.use('/uploads', express.static('uploads'));

// ======================
// TEST ROUTE
// ======================
app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

// ======================
// API ROUTES
// ======================
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapsRoutes);
app.use('/rides', rideRoutes);
app.use('/api/auth', authRoutes);

// ======================
// 404 ROUTE
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ======================
// EXPORT APP
// ======================
module.exports = app;