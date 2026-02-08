const express = require('express');
const router = express.Router();

// Import route modules
const accessRoutes = require('./access.routes');
const buildingRoutes = require('./building.routes');
const organizationRoutes = require('./organization.routes');
const employeeRoutes = require('./employee.routes');
const roleRoutes = require('./role.routes');
const doorRoutes = require('./door.routes');
const cardRoutes = require('./card.routes');
const dashboardRoutes = require('./dashboard.routes');

// Mount routes
router.use('/access', accessRoutes);
router.use('/buildings', buildingRoutes);
router.use('/organizations', organizationRoutes);
router.use('/employees', employeeRoutes);
router.use('/roles', roleRoutes);
router.use('/doors', doorRoutes);
router.use('/cards', cardRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
