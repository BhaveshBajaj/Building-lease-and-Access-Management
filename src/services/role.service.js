const roleRepository = require('../repositories/role.repository');
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');

class RoleService {
  async createRole(roleData, isAdmin = false) {
    // Only admins can create system roles
    if (roleData.is_system_role && !isAdmin) {
      throw new ForbiddenError('Only admins can create system roles');
    }

    // System roles should not have organization_id
    if (roleData.is_system_role && roleData.organization_id) {
      throw new ValidationError('System roles cannot belong to an organization');
    }

    // Organization roles must have organization_id
    if (!roleData.is_system_role && !roleData.organization_id) {
      throw new ValidationError('Organization-specific roles must have organization_id');
    }

    // Check if role name already exists for this scope
    const existingRole = await roleRepository.findByName(
      roleData.name,
      roleData.organization_id
    );

    if (existingRole) {
      throw new ConflictError('Role with this name already exists');
    }

    return roleRepository.create(roleData);
  }

  async getRoles(filters) {
    return roleRepository.findAll(filters);
  }

  async getRoleById(id) {
    return roleRepository.findById(id);
  }

  async updateRole(id, updates, isAdmin = false) {
    const role = await roleRepository.findById(id);

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Only admins can modify system roles
    if (role.is_system_role && !isAdmin) {
      throw new ForbiddenError('Only admins can modify system roles');
    }

    // Cannot change system role status
    if (updates.is_system_role !== undefined && updates.is_system_role !== role.is_system_role) {
      throw new ValidationError('Cannot change system role status');
    }

    return roleRepository.update(id, updates);
  }

  async deleteRole(id, isAdmin = false) {
    const role = await roleRepository.findById(id);

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    // Only admins can delete system roles
    if (role.is_system_role && !isAdmin) {
      throw new ForbiddenError('Only admins can delete system roles');
    }

    return roleRepository.delete(id);
  }

  async getSystemRoles() {
    return roleRepository.findSystemRoles();
  }

  async getOrganizationRoles(organizationId) {
    return roleRepository.findAll({ organizationId });
  }

  /**
   * Create predefined system role templates
   * Only callable by admins during setup
   */
  async createPredefinedRoles() {
    const predefinedRoles = [
      {
        name: 'Employee',
        is_system_role: true,
        description: 'Basic employee with access to public doors only'
      },
      {
        name: 'Manager',
        is_system_role: true,
        description: 'Manager with access to public and organization office doors'
      },
      {
        name: 'IT Admin',
        is_system_role: true,
        description: 'IT administrator with access to all doors including restricted areas'
      }
    ];

    const created = [];

    for (const roleData of predefinedRoles) {
      // Check if already exists
      const existing = await roleRepository.findByName(roleData.name, null);
      
      if (!existing) {
        const role = await roleRepository.create(roleData);
        created.push(role);
      }
    }

    return created;
  }
}

module.exports = new RoleService();
