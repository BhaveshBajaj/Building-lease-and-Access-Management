const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class OrganizationRepository {
  async create(orgData) {
    const { data, error } = await supabase
      .from('organization')
      .insert(orgData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Organization not found');
    }
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('organization')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Organization not found');
    }
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('organization')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Lease operations
  async createLease(leaseData) {
    const { data, error } = await supabase
      .from('lease')
      .insert(leaseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findLeasesByOrganization(organizationId) {
    const { data, error } = await supabase
      .from('lease')
      .select(`
        *,
        office_space:office_space_id (
          id,
          name,
          floor:floor_id (
            id,
            floor_number,
            building:building_id (
              id,
              name
            )
          )
        )
      `)
      .eq('organization_id', organizationId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findLeaseById(id) {
    const { data, error } = await supabase
      .from('lease')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Lease not found');
    }
    if (error) throw error;
    return data;
  }

  async findExpiredLeases() {
    const { data, error } = await supabase
      .from('lease')
      .select('*')
      .lt('end_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return data;
  }

  async findActiveLeasesByOrganization(organizationId) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('lease')
      .select('*')
      .eq('organization_id', organizationId)
      .lte('start_date', today)
      .gte('end_date', today);

    if (error) throw error;
    return data;
  }
}

module.exports = new OrganizationRepository();
