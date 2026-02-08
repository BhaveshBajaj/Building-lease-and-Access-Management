const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class PermissionRepository {
  async create(permissionData) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .insert(permissionData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        // Update existing permission instead
        return this.update(permissionData.role_id, permissionData.door_group_id, permissionData);
      }
      throw error;
    }
    return data;
  }

  async findAll(filters = {}) {
    let query = supabase
      .from('role_door_group_permission')
      .select(`
        *,
        role:role_id(id, name, organization_id, is_system_role),
        door_group:door_group_id(id, name, type)
      `);

    if (filters.roleId) {
      query = query.eq('role_id', filters.roleId);
    }

    if (filters.doorGroupId) {
      query = query.eq('door_group_id', filters.doorGroupId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .select(`
        *,
        role:role_id(id, name),
        door_group:door_group_id(id, name, type)
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Permission not found');
    }
    if (error) throw error;
    return data;
  }

  async findByRoleAndDoorGroup(roleId, doorGroupId) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .select('*')
      .eq('role_id', roleId)
      .eq('door_group_id', doorGroupId)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) throw error;
    return data;
  }

  async update(roleId, doorGroupId, updates) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .update(updates)
      .eq('role_id', roleId)
      .eq('door_group_id', doorGroupId)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Permission not found');
    }
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('role_door_group_permission')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async deleteByRoleAndDoorGroup(roleId, doorGroupId) {
    const { error } = await supabase
      .from('role_door_group_permission')
      .delete()
      .eq('role_id', roleId)
      .eq('door_group_id', doorGroupId);

    if (error) throw error;
  }

  async findPermissionsByRole(roleId) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .select(`
        *,
        door_group:door_group_id(id, name, type, description)
      `)
      .eq('role_id', roleId);

    if (error) throw error;
    return data;
  }

  /**
   * Check if a role has permission to access a specific door group
   * Returns the permission with time restrictions if exists
   */
  async checkRolePermission(roleId, doorGroupIds) {
    const { data, error } = await supabase
      .from('role_door_group_permission')
      .select('*')
      .eq('role_id', roleId)
      .in('door_group_id', doorGroupIds);

    if (error) throw error;
    return data;
  }
}

module.exports = new PermissionRepository();
