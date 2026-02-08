const dashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class DashboardController {
  // Get overall dashboard statistics
  getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getDashboardStats();
    return ApiResponse.success(res, stats, 'Dashboard statistics retrieved successfully');
  });

  // Get organization-specific dashboard statistics
  getOrganizationStats = asyncHandler(async (req, res) => {
    const stats = await dashboardService.getOrganizationStats(req.params.organizationId);
    return ApiResponse.success(res, stats, 'Organization statistics retrieved successfully');
  });
}

module.exports = new DashboardController();
