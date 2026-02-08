const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const buildingController = require('../controllers/building.controller');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// ==================== BUILDINGS ====================

// Get all buildings
router.get('/', buildingController.getAllBuildings);

// Create building (Admin only)
router.post(
  '/',
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('address').trim().notEmpty().withMessage('address is required'),
    body('timezone').optional().trim().notEmpty().withMessage('timezone cannot be empty'),
    validate
  ],
  buildingController.createBuilding
);

// Get building by ID
router.get('/:id', buildingController.getBuildingById);

// Update building (Admin only)
router.put(
  '/:id',
  requireAdmin,
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('address').optional().trim().notEmpty().withMessage('address cannot be empty'),
    body('timezone').optional().trim().notEmpty().withMessage('timezone cannot be empty'),
    validate
  ],
  buildingController.updateBuilding
);

// Delete building (Admin only)
router.delete('/:id', requireAdmin, buildingController.deleteBuilding);

// ==================== FLOORS ====================

// Get floors by building
router.get('/:buildingId/floors', buildingController.getFloorsByBuilding);

// Create floor
router.post(
  '/:buildingId/floors',
  [
    body('floor_number').isInt().withMessage('floor_number must be an integer'),
    validate
  ],
  buildingController.createFloor
);

// ==================== OFFICE SPACES ====================

// Get office spaces by floor
router.get('/floors/:floorId/spaces', buildingController.getOfficeSpacesByFloor);

// Create office space
router.post(
  '/floors/:floorId/spaces',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('seat_capacity').isInt({ min: 0 }).withMessage('seat_capacity must be a non-negative integer'),
    validate
  ],
  buildingController.createOfficeSpace
);

module.exports = router;
