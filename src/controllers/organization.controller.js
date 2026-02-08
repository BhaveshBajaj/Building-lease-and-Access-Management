const organizationService = require('../services/organization.service');
const roleService = require('../services/role.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class OrganizationController {
  // Organization operations
  createOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.createOrganization(req.body);
    return ApiResponse.created(res, organization, 'Organization created successfully');
  });

  getAllOrganizations = asyncHandler(async (req, res) => {
    const organizations = await organizationService.getAllOrganizations();
    return ApiResponse.success(res, organizations, 'Organizations retrieved successfully');
  });

  getOrganizationById = asyncHandler(async (req, res) => {
    const organization = await organizationService.getOrganizationById(req.params.id);
    return ApiResponse.success(res, organization, 'Organization retrieved successfully');
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const organization = await organizationService.updateOrganization(req.params.id, req.body);
    return ApiResponse.success(res, organization, 'Organization updated successfully');
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    await organizationService.deleteOrganization(req.params.id);
    return ApiResponse.noContent(res);
  });

  // Lease operations
  createLease = asyncHandler(async (req, res) => {
    const leaseData = {
      ...req.body,
      organization_id: req.params.id
    };
    const lease = await organizationService.createLease(leaseData);
    return ApiResponse.created(res, lease, 'Lease created successfully');
  });

  getLeasesByOrganization = asyncHandler(async (req, res) => {
    const leases = await organizationService.getLeasesByOrganization(req.params.id);
    return ApiResponse.success(res, leases, 'Leases retrieved successfully');
  });

  getLeaseById = asyncHandler(async (req, res) => {
    const lease = await organizationService.getLeaseById(req.params.leaseId);
    return ApiResponse.success(res, lease, 'Lease retrieved successfully');
  });

  getOfficeSpacesForOrganization = asyncHandler(async (req, res) => {
    const filters = {
      availability: req.query.availability,
      building_id: req.query.building_id,
      floor_id: req.query.floor_id,
      assigned: req.query.assigned
    };

    const spaces = await organizationService.getOfficeSpacesForOrganization(
      req.params.id,
      filters
    );

    return ApiResponse.success(res, spaces, 'Office spaces retrieved successfully');
  });

  // Role operations
  createRole = asyncHandler(async (req, res) => {
    const roleData = {
      ...req.body,
      organization_id: req.params.id,
      is_system_role: false
    };
    const role = await roleService.createRole(roleData);
    return ApiResponse.created(res, role, 'Role created successfully');
  });

  getRolesByOrganization = asyncHandler(async (req, res) => {
    const roles = await roleService.getOrganizationRoles(req.params.id);
    return ApiResponse.success(res, roles, 'Roles retrieved successfully');
  });
}

module.exports = new OrganizationController();
