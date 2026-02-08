const accessVerificationService = require('../services/accessVerification.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class AccessController {
  /**
   * POST /api/v1/access/verify
   * Verify card access to door (NO AUTH REQUIRED - for card readers)
   */
  verifyAccess = asyncHandler(async (req, res) => {
    const { card_uid, door_id } = req.body;

    const result = await accessVerificationService.verifyAccess(card_uid, door_id);

    // Return immediately for card reader
    return res.status(200).json(result);
  });

  /**
   * GET /api/v1/access/logs
   * Get access logs with filters (AUTH REQUIRED)
   */
  getAccessLogs = asyncHandler(async (req, res) => {
    const {
      card_uid,
      door_id,
      status,
      start_date,
      end_date,
      page = 1,
      limit = 50
    } = req.query;

    const filters = {
      cardUid: card_uid,
      doorId: door_id,
      status,
      startDate: start_date,
      endDate: end_date
    };

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await accessVerificationService.getAccessLogs(filters, pagination);

    return ApiResponse.paginated(res, result.data, result.pagination, 'Access logs retrieved');
  });

  /**
   * GET /api/v1/access/stats
   * Get access statistics (AUTH REQUIRED)
   */
  getAccessStats = asyncHandler(async (req, res) => {
    const { start_date, end_date, door_id } = req.query;

    const filters = {
      startDate: start_date,
      endDate: end_date,
      doorId: door_id
    };

    const stats = await accessVerificationService.getAccessStats(filters);

    return ApiResponse.success(res, stats, 'Access statistics retrieved');
  });

  /**
   * GET /api/v1/access/denied
   * Get denied access attempts (AUTH REQUIRED)
   */
  getDeniedAttempts = asyncHandler(async (req, res) => {
    const { start_date, end_date, limit = 100 } = req.query;

    const filters = {
      startDate: start_date,
      endDate: end_date
    };

    const deniedAttempts = await accessVerificationService.getDeniedAttempts(filters, parseInt(limit));

    return ApiResponse.success(res, deniedAttempts, 'Denied access attempts retrieved');
  });
}

module.exports = new AccessController();
