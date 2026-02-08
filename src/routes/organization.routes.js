const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const organizationController = require('../controllers/organization.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// ==================== ORGANIZATIONS ====================

// Get all organizations
router.get('/', organizationController.getAllOrganizations);

// Create organization
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    validate
  ],
  organizationController.createOrganization
);

// Get organization by ID
router.get('/:id', organizationController.getOrganizationById);

// Update organization
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    validate
  ],
  organizationController.updateOrganization
);

// Delete organization
router.delete('/:id', organizationController.deleteOrganization);

// ==================== LEASES ====================

// Get leases by organization
router.get('/:id/leases', organizationController.getLeasesByOrganization);

// Create lease
router.post(
  '/:id/leases',
  [
    body('office_space_id').isUUID().withMessage('office_space_id must be a valid UUID'),
    body('start_date').isISO8601().withMessage('start_date must be a valid date'),
    body('end_date').isISO8601().withMessage('end_date must be a valid date'),
    validate
  ],
  organizationController.createLease
);

// Get lease by ID
router.get('/:id/leases/:leaseId', organizationController.getLeaseById);

// ==================== OFFICE SPACES ====================

// Get office spaces with lease status for an organization
router.get(
  '/:id/office-spaces',
  [
    query('availability')
      .optional()
      .isIn(['available', 'leased', 'all'])
      .withMessage('availability must be available, leased, or all'),
    query('assigned')
      .optional()
      .isIn(['mine', 'others', 'all'])
      .withMessage('assigned must be mine, others, or all'),
    query('building_id')
      .optional()
      .isUUID()
      .withMessage('building_id must be a valid UUID'),
    query('floor_id')
      .optional()
      .isUUID()
      .withMessage('floor_id must be a valid UUID'),
    validate
  ],
  organizationController.getOfficeSpacesForOrganization
);

// ==================== ROLES ====================

// Get roles by organization
router.get('/:id/roles', organizationController.getRolesByOrganization);

// Create role for organization
router.post(
  '/:id/roles',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('description').optional().trim(),
    validate
  ],
  organizationController.createRole
);

module.exports = router;
