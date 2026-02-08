const supabase = require('../config/database');
const { NotFoundError } = require('../utils/errors');

class DoorRepository {
  // Door operations
  async createDoor(doorData) {
    const { data, error } = await supabase
      .from('door')
      .insert(doorData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAllDoors() {
    const { data, error } = await supabase
      .from('door')
      .select(`
        *,
        office_space:office_space_id(id, name),
        floor:floor_id(id, floor_number, building:building_id(id, name))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findDoorById(id) {
    const { data, error } = await supabase
      .from('door')
      .select(`
        *,
        office_space:office_space_id(id, name),
        floor:floor_id(id, floor_number, building:building_id(id, name, timezone)),
        door_groups:door_door_group(
          door_group:door_group_id(
            id,
            name,
            type,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Door not found');
    }
    if (error) throw error;
    return data;
  }

  async updateDoor(id, updates) {
    const { data, error } = await supabase
      .from('door')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Door not found');
    }
    if (error) throw error;
    return data;
  }

  async deleteDoor(id) {
    const { error } = await supabase
      .from('door')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Door Group operations
  async createDoorGroup(groupData) {
    const { data, error } = await supabase
      .from('door_group')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findAllDoorGroups() {
    const { data, error } = await supabase
      .from('door_group')
      .select('*')
      .order('type', { ascending: true });

    if (error) throw error;
    return data;
  }

  async findDoorGroupById(id) {
    const { data, error } = await supabase
      .from('door_group')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Door group not found');
    }
    if (error) throw error;
    return data;
  }

  async updateDoorGroup(id, updates) {
    const { data, error } = await supabase
      .from('door_group')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Door group not found');
    }
    if (error) throw error;
    return data;
  }

  async deleteDoorGroup(id) {
    const { error } = await supabase
      .from('door_group')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Door-DoorGroup junction operations
  async assignDoorToGroup(doorId, doorGroupId) {
    const { data, error } = await supabase
      .from('door_door_group')
      .insert({ door_id: doorId, door_group_id: doorGroupId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return null; // Already assigned
      }
      throw error;
    }
    return data;
  }

  async removeDoorFromGroup(doorId, doorGroupId) {
    const { error } = await supabase
      .from('door_door_group')
      .delete()
      .eq('door_id', doorId)
      .eq('door_group_id', doorGroupId);

    if (error) throw error;
  }

  async findDoorGroupsByDoor(doorId) {
    const { data, error } = await supabase
      .from('door_door_group')
      .select(`
        door_group:door_group_id(
          id,
          name,
          type,
          description
        )
      `)
      .eq('door_id', doorId);

    if (error) throw error;
    return data.map(item => item.door_group);
  }

  async findDoorsByGroup(doorGroupId) {
    const { data, error } = await supabase
      .from('door_door_group')
      .select(`
        door:door_id(
          id,
          name,
          location
        )
      `)
      .eq('door_group_id', doorGroupId);

    if (error) throw error;
    return data.map(item => item.door);
  }

  async bulkAssignDoorToGroups(doorId, doorGroupIds) {
    const insertData = doorGroupIds.map(groupId => ({
      door_id: doorId,
      door_group_id: groupId
    }));

    const { data, error } = await supabase
      .from('door_door_group')
      .insert(insertData)
      .select();

    if (error && error.code !== '23505') { // Ignore duplicate errors
      throw error;
    }
    return data || [];
  }
}

module.exports = new DoorRepository();
