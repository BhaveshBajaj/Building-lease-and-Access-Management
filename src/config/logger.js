const winston = require('winston');
const fs = require('fs');
const env = require('./env');

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'access-control-api' },
  transports: []
});

// Always log to console (Railway/containers rely on stdout/stderr)
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      if (stack) {
        return `${timestamp} [${level}]: ${message}\n${stack}`;
      }
      return `${timestamp} [${level}]: ${message}`;
    })
  )
}));

// Optional file logging (disabled by default; enable with LOG_TO_FILE=true)
if (process.env.LOG_TO_FILE === 'true') {
  fs.mkdirSync('logs', { recursive: true });
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
