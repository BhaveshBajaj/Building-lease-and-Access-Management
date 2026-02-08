const employeeRepository = require('../repositories/employee.repository');
const roleRepository = require('../repositories/role.repository');
const cardRepository = require('../repositories/card.repository');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');

class EmployeeService {
  async createEmployee(employeeData) {
    // Validate role exists
    const role = await roleRepository.findById(employeeData.role_id);
    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Check if email already exists
    const existingEmployee = await employeeRepository.findByEmail(employeeData.email);
    if (existingEmployee) {
      throw new ConflictError('Employee with this email already exists');
    }

    // If role is organization-specific, ensure employee is in same org
    if (role.organization_id && role.organization_id !== employeeData.organization_id) {
      throw new ValidationError('Role does not belong to employee organization');
    }

    return employeeRepository.create(employeeData);
  }

  async getEmployees(filters) {
    return employeeRepository.findAll(filters);
  }

  async getEmployeeById(id) {
    return employeeRepository.findById(id);
  }

  async updateEmployee(id, updates) {
    // If updating role, validate it exists
    if (updates.role_id) {
      const role = await roleRepository.findById(updates.role_id);
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    return employeeRepository.update(id, updates);
  }

  async deleteEmployee(id) {
    return employeeRepository.delete(id);
  }

  async deactivateEmployee(id) {
    // Update employee status - trigger will automatically deactivate card
    return employeeRepository.update(id, { status: 'INACTIVE' });
  }

  async activateEmployee(id) {
    const employee = await employeeRepository.findById(id);
    
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    // Reactivate employee
    await employeeRepository.update(id, { status: 'ACTIVE' });

    // Reactivate card if it exists
    const card = await cardRepository.findByEmployee(id);
    if (card && card.status === 'INACTIVE') {
      await cardRepository.update(card.id, { status: 'ACTIVE' });
    }

    return employeeRepository.findById(id);
  }

  async issueCard(employeeId, cardUid = null) {
    const employee = await employeeRepository.findById(employeeId);
    
    if (!employee) {
      throw new NotFoundError('Employee not found');
    }

    if (employee.status !== 'ACTIVE') {
      throw new ValidationError('Cannot issue card to inactive employee');
    }

    // Check if employee already has a card
    const existingCard = await cardRepository.findByEmployee(employeeId);
    if (existingCard) {
      throw new ConflictError('Employee already has an access card');
    }

    // Generate card UID if not provided
    const finalCardUid = cardUid || `CARD-${uuidv4()}`;

    const cardData = {
      card_uid: finalCardUid,
      employee_id: employeeId,
      status: 'ACTIVE',
      issued_at: new Date().toISOString()
    };

    return cardRepository.create(cardData);
  }

  async revokeCard(employeeId) {
    const card = await cardRepository.findByEmployee(employeeId);
    
    if (!card) {
      throw new NotFoundError('Employee has no access card');
    }

    return cardRepository.update(card.id, { status: 'BLOCKED' });
  }

  async replaceCard(employeeId, newCardUid = null) {
    // Mark old card as lost
    const oldCard = await cardRepository.findByEmployee(employeeId);
    if (oldCard) {
      await cardRepository.update(oldCard.id, { status: 'LOST' });
      await cardRepository.delete(oldCard.id);
    }

    // Issue new card
    return this.issueCard(employeeId, newCardUid);
  }

  async getEmployeesByOrganization(organizationId) {
    return employeeRepository.findByOrganization(organizationId);
  }
}

module.exports = new EmployeeService();
