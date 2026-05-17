const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const tripRoutes = require('./modules/trips/trip.routes');

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    }
  })
);

const allowedOrigins = (
  process.env.CLIENT_URLS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {

    if (
      !origin ||
      allowedOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(
      new Error('Not allowed by CORS')
    );
  },

  credentials: true
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,

  message: {
    error: 'Too many attempts'
  }
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,

  message: {
    error: 'Too many requests'
  }
});

app.use(generalLimiter);

app.use(express.json({
  limit: '10mb'
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, '../uploads')
  )
);

app.use(
  '/api/auth',
  authLimiter,
  authRoutes
);

app.use(
  '/api/events',
  eventRoutes
);

app.use(
  '/api/trips',
  tripRoutes
);

app.use(
  '/api/upload',
  uploadRoutes
);

app.use(
  '/api/admin',
  adminRoutes
);

app.get('/api/health', (req, res) => {

  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });

});

app.use((req, res) => {

  res.status(404).json({
    error: 'Route not found'
  });

});

app.use((err, req, res, next) => {

  console.error(err);

  res.status(
    err.status || 500
  ).json({
    error: err.code || (err.status === 403 ? 'FORBIDDEN' : 'SERVER_ERROR'),
    message:
      err.message ||
      'Internal server error'
  });

});

module.exports = app;
