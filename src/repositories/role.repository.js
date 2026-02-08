const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class RoleRepository {
  async create(roleData) {
    const { data, error } = await supabase
      .from('access_role')
      .insert(roleData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(filters = {}) {
    let query = supabase
      .from('access_role')
      .select('*, organization:organization_id(id, name)');

    if (filters.isSystemRole !== undefined) {
      query = query.eq('is_system_role', filters.isSystemRole);
    }

    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('access_role')
      .select('*, organization:organization_id(id, name)')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Role not found');
    }
    if (error) throw error;
    return data;
  }

  async findByName(name, organizationId = null) {
    let query = supabase
      .from('access_role')
      .select('*')
      .eq('name', name);

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    } else {
      query = query.is('organization_id', null);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('access_role')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Role not found');
    }
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('access_role')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async findSystemRoles() {
    const { data, error } = await supabase
      .from('access_role')
      .select('*')
      .eq('is_system_role', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }
}

module.exports = new RoleRepository();
