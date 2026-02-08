const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const accessController = require('../controllers/access.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

/**
 * POST /api/v1/access/verify
 * Verify card access to door
 * NO AUTHENTICATION REQUIRED - Used by card readers
 */
router.post(
  '/verify',
  [
    body('card_uid').trim().notEmpty().withMessage('card_uid is required'),
    body('door_id').isUUID().withMessage('door_id must be a valid UUID'),
    validate
  ],
  accessController.verifyAccess
);

/**
 * GET /api/v1/access/logs
 * Get access logs with filters
 * AUTHENTICATION REQUIRED
 */
router.get(
  '/logs',
  verifyFirebaseToken,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    query('status').optional().isIn(['GRANTED', 'DENIED']).withMessage('status must be GRANTED or DENIED'),
    validate
  ],
  accessController.getAccessLogs
);

/**
 * GET /api/v1/access/stats
 * Get access statistics
 * AUTHENTICATION REQUIRED
 */
router.get(
  '/stats',
  verifyFirebaseToken,
  accessController.getAccessStats
);

/**
 * GET /api/v1/access/denied
 * Get denied access attempts
 * AUTHENTICATION REQUIRED
 */
router.get(
  '/denied',
  verifyFirebaseToken,
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('limit must be between 1 and 1000'),
    validate
  ],
  accessController.getDeniedAttempts
);

module.exports = router;
