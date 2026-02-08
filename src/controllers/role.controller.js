const roleService = require('../services/role.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class RoleController {
  createRole = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.isAdmin || false;
    const role = await roleService.createRole(req.body, isAdmin);
    return ApiResponse.created(res, role, 'Role created successfully');
  });

  getRoles = asyncHandler(async (req, res) => {
    const { is_system_role, organization_id } = req.query;
    
    const filters = {};
    if (is_system_role !== undefined) {
      filters.isSystemRole = is_system_role === 'true';
    }
    if (organization_id) {
      filters.organizationId = organization_id;
    }

    const roles = await roleService.getRoles(filters);
    return ApiResponse.success(res, roles, 'Roles retrieved successfully');
  });

  getRoleById = asyncHandler(async (req, res) => {
    const role = await roleService.getRoleById(req.params.id);
    return ApiResponse.success(res, role, 'Role retrieved successfully');
  });

  updateRole = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.isAdmin || false;
    const role = await roleService.updateRole(req.params.id, req.body, isAdmin);
    return ApiResponse.success(res, role, 'Role updated successfully');
  });

  deleteRole = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.isAdmin || false;
    await roleService.deleteRole(req.params.id, isAdmin);
    return ApiResponse.noContent(res);
  });

  getSystemRoles = asyncHandler(async (req, res) => {
    const roles = await roleService.getSystemRoles();
    return ApiResponse.success(res, roles, 'System roles retrieved successfully');
  });
}

module.exports = new RoleController();
