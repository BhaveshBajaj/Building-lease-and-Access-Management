const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Middleware to validate request using express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => `${err.path}: ${err.msg}`);
    throw new ValidationError(messages.join(', '));
  }
  
  next();
};

module.exports = { validate };
