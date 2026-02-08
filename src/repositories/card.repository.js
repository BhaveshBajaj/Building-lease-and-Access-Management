const supabase = require('../config/database');
const { NotFoundError, ConflictError } = require('../utils/errors');

class CardRepository {
  async create(cardData) {
    const { data, error } = await supabase
      .from('access_card')
      .insert(cardData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new ConflictError('Card UID or employee already has a card');
      }
      throw error;
    }
    return data;
  }

  async findByUid(cardUid) {
    const { data, error } = await supabase
      .from('access_card')
      .select(`
        *,
        employee:employee_id(
          id,
          name,
          email,
          status,
          organization_id,
          role:role_id(
            id,
            name,
            is_system_role,
            organization_id
          )
        )
      `)
      .eq('card_uid', cardUid)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) throw error;
    return data;
  }

  async findByEmployee(employeeId) {
    const { data, error } = await supabase
      .from('access_card')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('access_card')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Access card not found');
    }
    if (error) throw error;
    return data;
  }

  async findAll(filters = {}) {
    let query = supabase
      .from('access_card')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.employee_id) {
      query = query.eq('employee_id', filters.employee_id);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('access_card')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Access card not found');
    }
    if (error) throw error;
    return data;
  }

  async updateByUid(cardUid, updates) {
    const { data, error } = await supabase
      .from('access_card')
      .update(updates)
      .eq('card_uid', cardUid)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Access card not found');
    }
    if (error) throw error;
    return data;
  }

  async markInactive(employeeId) {
    const { data, error } = await supabase
      .from('access_card')
      .update({ status: 'INACTIVE' })
      .eq('employee_id', employeeId)
      .eq('status', 'ACTIVE')
      .select();

    if (error) throw error;
    return data;
  }

  async bulkMarkInactive(employeeIds) {
    const { data, error } = await supabase
      .from('access_card')
      .update({ status: 'INACTIVE' })
      .in('employee_id', employeeIds)
      .eq('status', 'ACTIVE')
      .select();

    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('access_card')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

module.exports = new CardRepository();
