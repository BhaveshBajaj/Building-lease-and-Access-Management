const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const routes = require('./routes');
const env = require('./config/env');
const logger = require('./config/logger');

const app = express();

// Trust proxy (for deployment behind reverse proxies like nginx, AWS ALB)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
const corsOriginEnv = (env.CORS_ORIGIN || '*').trim();
const isWildcardOrigin = corsOriginEnv === '*';
const allowedOrigins = isWildcardOrigin
  ? []
  : corsOriginEnv.split(',').map((origin) => origin.trim()).filter(Boolean);

const corsOptions = {
  origin: isWildcardOrigin
    ? '*'
    : (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) with no Origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin not allowed: ${origin}`));
    },
  // Wildcard origins are incompatible with credentials=true
  credentials: !isWildcardOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting (general API + dedicated card-reader verification limiter)
// Note: because the general limiter is mounted at /api, req.path won't include /api.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.API_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  // Skip general limiter for card readers; apply a dedicated limiter instead.
  skip: (req) => req.originalUrl.startsWith('/api/v1/access/verify'),
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/', limiter);

// Card-reader verification can legitimately be bursty (rush-hour). Use a separate limiter
// with a much higher ceiling to provide DoS resistance without locking people out.
const accessVerifyLimiter = rateLimit({
  windowMs: env.ACCESS_VERIFY_WINDOW_MS,
  max: env.ACCESS_VERIFY_RATE_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many verification requests, please try again later'
});

app.use('/api/v1/access/verify', accessVerifyLimiter);

// Request logging
app.use(requestLogger);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Building Access Control API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api/v1/health'
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
