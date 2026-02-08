const doorService = require('../services/door.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class DoorController {
  // Door operations
  createDoor = asyncHandler(async (req, res) => {
    const door = await doorService.createDoor(req.body);
    return ApiResponse.created(res, door, 'Door created successfully');
  });

  getAllDoors = asyncHandler(async (req, res) => {
    const doors = await doorService.getAllDoors();
    return ApiResponse.success(res, doors, 'Doors retrieved successfully');
  });

  getDoorById = asyncHandler(async (req, res) => {
    const door = await doorService.getDoorById(req.params.id);
    return ApiResponse.success(res, door, 'Door retrieved successfully');
  });

  updateDoor = asyncHandler(async (req, res) => {
    const door = await doorService.updateDoor(req.params.id, req.body);
    return ApiResponse.success(res, door, 'Door updated successfully');
  });

  deleteDoor = asyncHandler(async (req, res) => {
    await doorService.deleteDoor(req.params.id);
    return ApiResponse.noContent(res);
  });

  // Door Group operations
  createDoorGroup = asyncHandler(async (req, res) => {
    const group = await doorService.createDoorGroup(req.body);
    return ApiResponse.created(res, group, 'Door group created successfully');
  });

  getAllDoorGroups = asyncHandler(async (req, res) => {
    const groups = await doorService.getAllDoorGroups();
    return ApiResponse.success(res, groups, 'Door groups retrieved successfully');
  });

  getDoorGroupById = asyncHandler(async (req, res) => {
    const group = await doorService.getDoorGroupById(req.params.id);
    return ApiResponse.success(res, group, 'Door group retrieved successfully');
  });

  updateDoorGroup = asyncHandler(async (req, res) => {
    const group = await doorService.updateDoorGroup(req.params.id, req.body);
    return ApiResponse.success(res, group, 'Door group updated successfully');
  });

  deleteDoorGroup = asyncHandler(async (req, res) => {
    await doorService.deleteDoorGroup(req.params.id);
    return ApiResponse.noContent(res);
  });

  // Door-Group assignment
  assignDoorToGroup = asyncHandler(async (req, res) => {
    const { door_group_id } = req.body;
    const result = await doorService.assignDoorToGroup(req.params.id, door_group_id);
    return ApiResponse.created(res, result, 'Door assigned to group successfully');
  });

  assignDoorToMultipleGroups = asyncHandler(async (req, res) => {
    const { door_group_ids } = req.body;
    const result = await doorService.assignDoorToMultipleGroups(req.params.id, door_group_ids);
    return ApiResponse.created(res, result, 'Door assigned to groups successfully');
  });

  removeDoorFromGroup = asyncHandler(async (req, res) => {
    await doorService.removeDoorFromGroup(req.params.id, req.params.groupId);
    return ApiResponse.noContent(res);
  });

  getDoorGroups = asyncHandler(async (req, res) => {
    const groups = await doorService.getDoorGroups(req.params.id);
    return ApiResponse.success(res, groups, 'Door groups retrieved successfully');
  });

  getDoorsInGroup = asyncHandler(async (req, res) => {
    const doors = await doorService.getDoorsInGroup(req.params.id);
    return ApiResponse.success(res, doors, 'Doors in group retrieved successfully');
  });

  // Permission operations
  assignRolePermission = asyncHandler(async (req, res) => {
    const permission = await doorService.assignRolePermission(req.body);
    return ApiResponse.created(res, permission, 'Role permission assigned successfully');
  });

  getPermissions = asyncHandler(async (req, res) => {
    const { role_id, door_group_id } = req.query;
    const filters = { roleId: role_id, doorGroupId: door_group_id };
    const permissions = await doorService.getPermissions(filters);
    return ApiResponse.success(res, permissions, 'Permissions retrieved successfully');
  });

  getRolePermissions = asyncHandler(async (req, res) => {
    const permissions = await doorService.getRolePermissions(req.params.roleId);
    return ApiResponse.success(res, permissions, 'Role permissions retrieved successfully');
  });

  deletePermission = asyncHandler(async (req, res) => {
    await doorService.deletePermission(req.params.id);
    return ApiResponse.noContent(res);
  });
}

module.exports = new DoorController();
