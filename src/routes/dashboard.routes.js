const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyFirebaseToken } = require('../middleware/auth.middleware');

router.use(verifyFirebaseToken); // All routes require authentication

// Get overall dashboard stats
router.get('/', dashboardController.getDashboardStats);

// Get organization-specific stats
router.get('/organizations/:organizationId', dashboardController.getOrganizationStats);

module.exports = router;
