const buildingService = require('../services/building.service');
const organizationService = require('../services/organization.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class BuildingController {
  // Building operations
  createBuilding = asyncHandler(async (req, res) => {
    const building = await buildingService.createBuilding(req.body);
    return ApiResponse.created(res, building, 'Building created successfully');
  });

  getAllBuildings = asyncHandler(async (req, res) => {
    const buildings = await buildingService.getAllBuildings();
    return ApiResponse.success(res, buildings, 'Buildings retrieved successfully');
  });

  getBuildingById = asyncHandler(async (req, res) => {
    const building = await buildingService.getBuildingById(req.params.id);
    return ApiResponse.success(res, building, 'Building retrieved successfully');
  });

  updateBuilding = asyncHandler(async (req, res) => {
    const building = await buildingService.updateBuilding(req.params.id, req.body);
    return ApiResponse.success(res, building, 'Building updated successfully');
  });

  deleteBuilding = asyncHandler(async (req, res) => {
    await buildingService.deleteBuilding(req.params.id);
    return ApiResponse.noContent(res);
  });

  // Floor operations
  createFloor = asyncHandler(async (req, res) => {
    const floorData = {
      ...req.body,
      building_id: req.params.buildingId
    };
    const floor = await buildingService.createFloor(floorData);
    return ApiResponse.created(res, floor, 'Floor created successfully');
  });

  getFloorsByBuilding = asyncHandler(async (req, res) => {
    const floors = await buildingService.getFloorsByBuilding(req.params.buildingId);
    return ApiResponse.success(res, floors, 'Floors retrieved successfully');
  });

  // Office Space operations
  createOfficeSpace = asyncHandler(async (req, res) => {
    const spaceData = {
      ...req.body,
      floor_id: req.params.floorId
    };
    const space = await buildingService.createOfficeSpace(spaceData);
    return ApiResponse.created(res, space, 'Office space created successfully');
  });

  getOfficeSpacesByFloor = asyncHandler(async (req, res) => {
    const spaces = await buildingService.getOfficeSpacesByFloor(req.params.floorId);
    return ApiResponse.success(res, spaces, 'Office spaces retrieved successfully');
  });
}

module.exports = new BuildingController();
