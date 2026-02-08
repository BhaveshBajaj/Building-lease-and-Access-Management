const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const doorController = require('../controllers/door.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// ==================== DOORS ====================

// Get all doors
router.get('/', doorController.getAllDoors);

// Create door
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('location').trim().notEmpty().withMessage('location is required'),
    body('office_space_id').optional().isUUID().withMessage('office_space_id must be a valid UUID'),
    body('floor_id').optional().isUUID().withMessage('floor_id must be a valid UUID'),
    body('door_group_ids').optional().isArray().withMessage('door_group_ids must be an array'),
    body('door_group_ids.*').optional().isUUID().withMessage('Each door_group_id must be a valid UUID'),
    validate
  ],
  doorController.createDoor
);

// Get door by ID
router.get('/:id', doorController.getDoorById);

// Update door
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('location').optional().trim().notEmpty().withMessage('location cannot be empty'),
    body('office_space_id').optional().isUUID().withMessage('office_space_id must be a valid UUID'),
    body('floor_id').optional().isUUID().withMessage('floor_id must be a valid UUID'),
    validate
  ],
  doorController.updateDoor
);

// Delete door
router.delete('/:id', doorController.deleteDoor);

// Get door's groups
router.get('/:id/groups', doorController.getDoorGroups);

// Assign door to a single group
router.post(
  '/:id/groups',
  [
    body('door_group_id').isUUID().withMessage('door_group_id must be a valid UUID'),
    validate
  ],
  doorController.assignDoorToGroup
);

// Assign door to multiple groups
router.post(
  '/:id/groups/bulk',
  [
    body('door_group_ids').isArray().withMessage('door_group_ids must be an array'),
    body('door_group_ids.*').isUUID().withMessage('Each door_group_id must be a valid UUID'),
    validate
  ],
  doorController.assignDoorToMultipleGroups
);

// Remove door from group
router.delete('/:id/groups/:groupId', doorController.removeDoorFromGroup);

// ==================== DOOR GROUPS ====================

// Get all door groups
router.get('/groups/all', doorController.getAllDoorGroups);

// Create door group
router.post(
  '/groups',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('type').isIn(['PUBLIC', 'PRIVATE', 'RESTRICTED']).withMessage('type must be PUBLIC, PRIVATE, or RESTRICTED'),
    body('description').optional().trim(),
    validate
  ],
  doorController.createDoorGroup
);

// Get door group by ID
router.get('/groups/:id', doorController.getDoorGroupById);

// Update door group
router.put(
  '/groups/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('type').optional().isIn(['PUBLIC', 'PRIVATE', 'RESTRICTED']).withMessage('type must be PUBLIC, PRIVATE, or RESTRICTED'),
    body('description').optional().trim(),
    validate
  ],
  doorController.updateDoorGroup
);

// Delete door group
router.delete('/groups/:id', doorController.deleteDoorGroup);

// Get doors in a group
router.get('/groups/:id/doors', doorController.getDoorsInGroup);

// ==================== PERMISSIONS ====================

// Get permissions
router.get(
  '/permissions',
  [
    query('role_id').optional().isUUID().withMessage('role_id must be a valid UUID'),
    query('door_group_id').optional().isUUID().withMessage('door_group_id must be a valid UUID'),
    validate
  ],
  doorController.getPermissions
);

// Assign role permission
router.post(
  '/permissions',
  [
    body('role_id').isUUID().withMessage('role_id must be a valid UUID'),
    body('door_group_id').isUUID().withMessage('door_group_id must be a valid UUID'),
    body('access_type').isIn(['ALWAYS', 'TIME_BOUND']).withMessage('access_type must be ALWAYS or TIME_BOUND'),
    body('start_time').optional().matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/).withMessage('start_time must be in HH:mm:ss format'),
    body('end_time').optional().matches(/^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/).withMessage('end_time must be in HH:mm:ss format'),
    validate
  ],
  doorController.assignRolePermission
);

// Get role permissions
router.get('/permissions/role/:roleId', doorController.getRolePermissions);

// Delete permission
router.delete('/permissions/:id', doorController.deletePermission);

module.exports = router;
