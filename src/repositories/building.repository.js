const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class BuildingRepository {
  async create(buildingData) {
    const { data, error } = await supabase
      .from('building')
      .insert(buildingData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAll() {
    const { data, error } = await supabase
      .from('building')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('building')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Building not found');
    }
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('building')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Building not found');
    }
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('building')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Floor operations
  async createFloor(floorData) {
    const { data, error } = await supabase
      .from('floor')
      .insert(floorData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findFloorsByBuilding(buildingId) {
    const { data, error } = await supabase
      .from('floor')
      .select('*')
      .eq('building_id', buildingId)
      .order('floor_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findFloorById(id) {
    const { data, error } = await supabase
      .from('floor')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Floor not found');
    }
    if (error) throw error;
    return data;
  }

  // Office Space operations
  async createOfficeSpace(spaceData) {
    const { data, error } = await supabase
      .from('office_space')
      .insert(spaceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findOfficeSpacesByFloor(floorId) {
    const { data, error } = await supabase
      .from('office_space')
      .select('*')
      .eq('floor_id', floorId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOfficeSpacesWithLeases() {
    const { data, error } = await supabase
      .from('office_space')
      .select(`
        *,
        floor:floor_id(
          id,
          floor_number,
          building:building_id(
            id,
            name,
            address
          )
        ),
        leases:lease(
          id,
          organization_id,
          start_date,
          end_date
        )
      `)
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findOfficeSpaceById(id) {
    const { data, error } = await supabase
      .from('office_space')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Office space not found');
    }
    if (error) throw error;
    return data;
  }
}

module.exports = new BuildingRepository();
