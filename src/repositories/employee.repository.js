const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class EmployeeRepository {
  async create(employeeData) {
    const { data, error } = await supabase
      .from('employee')
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll(filters = {}) {
    let query = supabase
      .from('employee')
      .select(`
        *,
        organization:organization_id(id, name),
        role:role_id(id, name, is_system_role)
      `);

    if (filters.organizationId) {
      query = query.eq('organization_id', filters.organizationId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('employee')
      .select(`
        *,
        organization:organization_id(id, name),
        role:role_id(id, name, is_system_role, organization_id),
        access_card:access_card(id, card_uid, status, issued_at)
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Employee not found');
    }
    if (error) throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('employee')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Employee not found');
    }
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('employee')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async findByOrganization(organizationId) {
    const { data, error } = await supabase
      .from('employee')
      .select(`
        *,
        role:role_id(id, name),
        access_card:access_card(card_uid, status)
      `)
      .eq('organization_id', organizationId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findEmployeesWithExpiredLeases(expiredLeaseIds) {
    // Find employees in organizations with expired leases
    const { data: leases, error: leaseError } = await supabase
      .from('lease')
      .select('organization_id')
      .in('id', expiredLeaseIds);

    if (leaseError) throw leaseError;

    const orgIds = [...new Set(leases.map(l => l.organization_id))];

    const { data, error } = await supabase
      .from('employee')
      .select('id, organization_id, status')
      .in('organization_id', orgIds)
      .eq('status', 'ACTIVE');

    if (error) throw error;
    return data;
  }
}

module.exports = new EmployeeRepository();
