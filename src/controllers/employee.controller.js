const employeeService = require('../services/employee.service');
const ApiResponse = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

class EmployeeController {
  createEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.createEmployee(req.body);
    return ApiResponse.created(res, employee, 'Employee created successfully');
  });

  getEmployees = asyncHandler(async (req, res) => {
    const { organization_id, status } = req.query;
    const filters = { organizationId: organization_id, status };
    const employees = await employeeService.getEmployees(filters);
    return ApiResponse.success(res, employees, 'Employees retrieved successfully');
  });

  getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await employeeService.getEmployeeById(req.params.id);
    return ApiResponse.success(res, employee, 'Employee retrieved successfully');
  });

  updateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.updateEmployee(req.params.id, req.body);
    return ApiResponse.success(res, employee, 'Employee updated successfully');
  });

  deleteEmployee = asyncHandler(async (req, res) => {
    await employeeService.deleteEmployee(req.params.id);
    return ApiResponse.noContent(res);
  });

  deactivateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.deactivateEmployee(req.params.id);
    return ApiResponse.success(res, employee, 'Employee deactivated successfully');
  });

  activateEmployee = asyncHandler(async (req, res) => {
    const employee = await employeeService.activateEmployee(req.params.id);
    return ApiResponse.success(res, employee, 'Employee activated successfully');
  });

  issueCard = asyncHandler(async (req, res) => {
    const { card_uid } = req.body;
    const card = await employeeService.issueCard(req.params.id, card_uid);
    return ApiResponse.created(res, card, 'Access card issued successfully');
  });

  revokeCard = asyncHandler(async (req, res) => {
    const card = await employeeService.revokeCard(req.params.id);
    return ApiResponse.success(res, card, 'Access card revoked successfully');
  });

  replaceCard = asyncHandler(async (req, res) => {
    const { new_card_uid } = req.body;
    const card = await employeeService.replaceCard(req.params.id, new_card_uid);
    return ApiResponse.created(res, card, 'Access card replaced successfully');
  });
}

module.exports = new EmployeeController();
