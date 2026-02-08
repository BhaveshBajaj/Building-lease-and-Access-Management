const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const roleController = require('../controllers/role.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// Get all roles
router.get(
  '/',
  [
    query('is_system_role').optional().isBoolean().withMessage('is_system_role must be boolean'),
    query('organization_id').optional().isUUID().withMessage('organization_id must be a valid UUID'),
    validate
  ],
  roleController.getRoles
);

// Get system roles
router.get('/system', roleController.getSystemRoles);

// Create role
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('organization_id')
      .if(body('is_system_role').not().equals(true))
      .notEmpty()
      .withMessage('organization_id is required for organization-specific roles')
      .isUUID()
      .withMessage('organization_id must be a valid UUID'),
    body('is_system_role').optional().isBoolean().withMessage('is_system_role must be boolean'),
    body('description').optional().trim(),
    validate
  ],
  roleController.createRole
);

// Get role by ID
router.get('/:id', roleController.getRoleById);

// Update role
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('description').optional().trim(),
    validate
  ],
  roleController.updateRole
);

// Delete role
router.delete('/:id', roleController.deleteRole);

module.exports = router;
