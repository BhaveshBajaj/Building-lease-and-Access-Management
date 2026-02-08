const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const cardController = require('../controllers/card.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// Get all cards
router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'LOST', 'BLOCKED'])
      .withMessage('status must be ACTIVE, INACTIVE, LOST, or BLOCKED'),
    query('employee_id')
      .optional()
      .isUUID()
      .withMessage('employee_id must be a valid UUID'),
    validate
  ],
  cardController.getCards
);

// Create card
router.post(
  '/',
  [
    body('card_uid').trim().notEmpty().withMessage('card_uid is required'),
    body('employee_id').isUUID().withMessage('employee_id must be a valid UUID'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'LOST', 'BLOCKED'])
      .withMessage('status must be ACTIVE, INACTIVE, LOST, or BLOCKED'),
    validate
  ],
  cardController.createCard
);

// Get card by UID (card number)
router.get(
  '/uid/:uid',
  [
    param('uid').trim().notEmpty().withMessage('uid is required'),
    validate
  ],
  cardController.getCardByUid
);

// Get card by employee ID
router.get(
  '/employee/:employeeId',
  [
    param('employeeId').isUUID().withMessage('employeeId must be a valid UUID'),
    validate
  ],
  cardController.getCardByEmployee
);

// Get card by ID
router.get('/:id', cardController.getCardById);

// Update card by ID
router.put(
  '/:id',
  [
    body('card_uid').optional().trim().notEmpty().withMessage('card_uid cannot be empty'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'LOST', 'BLOCKED'])
      .withMessage('status must be ACTIVE, INACTIVE, LOST, or BLOCKED'),
    validate
  ],
  cardController.updateCard
);

// Update card by UID
router.put(
  '/uid/:uid',
  [
    param('uid').trim().notEmpty().withMessage('uid is required'),
    body('status')
      .optional()
      .isIn(['ACTIVE', 'INACTIVE', 'LOST', 'BLOCKED'])
      .withMessage('status must be ACTIVE, INACTIVE, LOST, or BLOCKED'),
    validate
  ],
  cardController.updateCardByUid
);

// Deactivate card
router.patch('/:id/deactivate', cardController.deactivateCard);

// Block card
router.patch('/:id/block', cardController.blockCard);

// Report lost card
router.patch('/:id/report-lost', cardController.reportLostCard);

// Delete card
router.delete('/:id', cardController.deleteCard);

module.exports = router;
