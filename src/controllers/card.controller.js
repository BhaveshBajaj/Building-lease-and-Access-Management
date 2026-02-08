const cardService = require('../services/card.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class CardController {
  createCard = asyncHandler(async (req, res) => {
    const card = await cardService.createCard(req.body);
    return ApiResponse.created(res, card, 'Access card created successfully');
  });

  getCards = asyncHandler(async (req, res) => {
    const filters = {
      status: req.query.status,
      employee_id: req.query.employee_id
    };
    const cards = await cardService.getCards(filters);
    return ApiResponse.success(res, cards, 'Access cards retrieved successfully');
  });

  getCardByUid = asyncHandler(async (req, res) => {
    const card = await cardService.getCardByUid(req.params.uid);
    return ApiResponse.success(res, card, 'Access card retrieved successfully');
  });

  getCardById = asyncHandler(async (req, res) => {
    const card = await cardService.getCardById(req.params.id);
    return ApiResponse.success(res, card, 'Access card retrieved successfully');
  });

  getCardByEmployee = asyncHandler(async (req, res) => {
    const card = await cardService.getCardByEmployee(req.params.employeeId);
    return ApiResponse.success(res, card, 'Access card retrieved successfully');
  });

  updateCard = asyncHandler(async (req, res) => {
    const card = await cardService.updateCard(req.params.id, req.body);
    return ApiResponse.success(res, card, 'Access card updated successfully');
  });

  updateCardByUid = asyncHandler(async (req, res) => {
    const card = await cardService.updateCardByUid(req.params.uid, req.body);
    return ApiResponse.success(res, card, 'Access card updated successfully');
  });

  deactivateCard = asyncHandler(async (req, res) => {
    const card = await cardService.deactivateCard(req.params.id);
    return ApiResponse.success(res, card, 'Access card deactivated successfully');
  });

  blockCard = asyncHandler(async (req, res) => {
    const card = await cardService.blockCard(req.params.id);
    return ApiResponse.success(res, card, 'Access card blocked successfully');
  });

  reportLostCard = asyncHandler(async (req, res) => {
    const card = await cardService.reportLostCard(req.params.id);
    return ApiResponse.success(res, card, 'Access card marked as lost successfully');
  });

  deleteCard = asyncHandler(async (req, res) => {
    await cardService.deleteCard(req.params.id);
    return ApiResponse.noContent(res);
  });
}

module.exports = new CardController();
