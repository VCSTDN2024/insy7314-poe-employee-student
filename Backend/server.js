const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

// Logging server startup for debugging

console.log('Starting server...');
// Loading environment variables from .env file
dotenv.config();
// Verifying ATLAS_URI environment variable
console.log('Environment variables loaded:', process.env.ATLAS_URI ? 'ATLAS_URI set' : 'ATLAS_URI missing');
// Initializing Express application
const app = express();
// Applying Helmet middleware for security headers (clickjacking, XSS protection)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  xssFilter: true,
}));
// Configuring rate limiting to prevent DDoS attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);
// Enabling CORS for React frontend at http://localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

console.log('Connecting to MongoDB...');

// Connecting to MongoDB Atlas using ATLAS_URI
mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Logging route loading for debugging
console.log('Loading routes...');



// Importing authentication and payment routes
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const employeeRoutes = require('./routes/employee');

console.log('Routes loaded:', { authRoutes, paymentRoutes });

// Mounting routes under /api/auth and /api/payment
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/employee', employeeRoutes);
// Configuring SSL certificates for HTTPS
const options = {
  key: fs.readFileSync('keys/privatekey.pem'),
  cert: fs.readFileSync('keys/certificate.pem'),
};

console.log('Starting HTTPS server...');

// Creating and starting HTTPS server on specified port
https.createServer(options, app).listen(process.env.PORT || 5000, () => {
  console.log(`Server running on https://localhost:${process.env.PORT}`);
});