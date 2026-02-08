const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const employeeController = require('../controllers/employee.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// Get all employees
router.get(
  '/',
  [
    query('organization_id').optional().isUUID().withMessage('organization_id must be a valid UUID'),
    query('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
    validate
  ],
  employeeController.getEmployees
);

// Create employee
router.post(
  '/',
  [
    body('organization_id').isUUID().withMessage('organization_id must be a valid UUID'),
    body('role_id').isUUID().withMessage('role_id must be a valid UUID'),
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('email must be valid'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
    validate
  ],
  employeeController.createEmployee
);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee
router.put(
  '/:id',
  [
    body('role_id').optional().isUUID().withMessage('role_id must be a valid UUID'),
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('email').optional().isEmail().withMessage('email must be valid'),
    body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('status must be ACTIVE or INACTIVE'),
    validate
  ],
  employeeController.updateEmployee
);

// Delete employee
router.delete('/:id', employeeController.deleteEmployee);

// Deactivate employee
router.patch('/:id/deactivate', employeeController.deactivateEmployee);

// Activate employee
router.patch('/:id/activate', employeeController.activateEmployee);

// Issue access card
router.post(
  '/:id/issue-card',
  [
    body('card_uid').optional().trim().notEmpty().withMessage('card_uid cannot be empty'),
    validate
  ],
  employeeController.issueCard
);

// Revoke access card
router.post('/:id/revoke-card', employeeController.revokeCard);

// Replace access card
router.post(
  '/:id/replace-card',
  [
    body('new_card_uid').optional().trim().notEmpty().withMessage('new_card_uid cannot be empty'),
    validate
  ],
  employeeController.replaceCard
);

module.exports = router;
