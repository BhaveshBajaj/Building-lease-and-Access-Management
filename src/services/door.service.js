const doorRepository = require('../repositories/door.repository');
const permissionRepository = require('../repositories/permission.repository');
const { ValidationError, NotFoundError } = require('../utils/errors');
const TimeHelper = require('../utils/timeHelper');

class DoorService {
  // Door operations
  async createDoor(doorData) {
    const { door_group_ids, ...doorInfo } = doorData;
    
    // Create the door
    const door = await doorRepository.createDoor(doorInfo);

    // Assign to door groups if provided
    if (door_group_ids && door_group_ids.length > 0) {
      await doorRepository.bulkAssignDoorToGroups(door.id, door_group_ids);
    }

    return doorRepository.findDoorById(door.id);
  }

  async getAllDoors() {
    return doorRepository.findAllDoors();
  }

  async getDoorById(id) {
    return doorRepository.findDoorById(id);
  }

  async updateDoor(id, updates) {
    return doorRepository.updateDoor(id, updates);
  }

  async deleteDoor(id) {
    return doorRepository.deleteDoor(id);
  }

  // Door Group operations
  async createDoorGroup(groupData) {
    // Validate door group type
    const validTypes = ['PUBLIC', 'PRIVATE', 'RESTRICTED'];
    if (!validTypes.includes(groupData.type)) {
      throw new ValidationError(`Door group type must be one of: ${validTypes.join(', ')}`);
    }

    return doorRepository.createDoorGroup(groupData);
  }

  async getAllDoorGroups() {
    return doorRepository.findAllDoorGroups();
  }

  async getDoorGroupById(id) {
    return doorRepository.findDoorGroupById(id);
  }

  async updateDoorGroup(id, updates) {
    if (updates.type) {
      const validTypes = ['PUBLIC', 'PRIVATE', 'RESTRICTED'];
      if (!validTypes.includes(updates.type)) {
        throw new ValidationError(`Door group type must be one of: ${validTypes.join(', ')}`);
      }
    }

    return doorRepository.updateDoorGroup(id, updates);
  }

  async deleteDoorGroup(id) {
    return doorRepository.deleteDoorGroup(id);
  }

  // Door-Group assignment
  async assignDoorToGroup(doorId, doorGroupId) {
    // Validate door exists
    await doorRepository.findDoorById(doorId);
    
    // Validate door group exists
    await doorRepository.findDoorGroupById(doorGroupId);

    const result = await doorRepository.assignDoorToGroup(doorId, doorGroupId);
    
    if (!result) {
      return { message: 'Door already assigned to this group' };
    }

    return result;
  }

  async removeDoorFromGroup(doorId, doorGroupId) {
    return doorRepository.removeDoorFromGroup(doorId, doorGroupId);
  }

  async getDoorGroups(doorId) {
    return doorRepository.findDoorGroupsByDoor(doorId);
  }

  async getDoorsInGroup(doorGroupId) {
    return doorRepository.findDoorsByGroup(doorGroupId);
  }

  async assignDoorToMultipleGroups(doorId, doorGroupIds) {
    // Validate door exists
    await doorRepository.findDoorById(doorId);

    // Validate all door groups exist
    for (const groupId of doorGroupIds) {
      await doorRepository.findDoorGroupById(groupId);
    }

    return doorRepository.bulkAssignDoorToGroups(doorId, doorGroupIds);
  }

  // Permission operations
  async assignRolePermission(permissionData) {
    // Validate role exists
    const roleRepository = require('../repositories/role.repository');
    await roleRepository.findById(permissionData.role_id);

    // Validate door group exists
    await doorRepository.findDoorGroupById(permissionData.door_group_id);

    // Validate time format if TIME_BOUND
    if (permissionData.access_type === 'TIME_BOUND') {
      if (!permissionData.start_time || !permissionData.end_time) {
        throw new ValidationError('TIME_BOUND access requires start_time and end_time');
      }

      if (!TimeHelper.isValidTimeFormat(permissionData.start_time) || 
          !TimeHelper.isValidTimeFormat(permissionData.end_time)) {
        throw new ValidationError('Time must be in HH:mm:ss format');
      }
    }

    return permissionRepository.create(permissionData);
  }

  async getPermissions(filters) {
    return permissionRepository.findAll(filters);
  }

  async getPermissionById(id) {
    return permissionRepository.findById(id);
  }

  async getRolePermissions(roleId) {
    return permissionRepository.findPermissionsByRole(roleId);
  }

  async updatePermission(id, updates) {
    // Validate time format if updating time-bound access
    if (updates.access_type === 'TIME_BOUND' || updates.start_time || updates.end_time) {
      if (updates.start_time && !TimeHelper.isValidTimeFormat(updates.start_time)) {
        throw new ValidationError('start_time must be in HH:mm:ss format');
      }
      if (updates.end_time && !TimeHelper.isValidTimeFormat(updates.end_time)) {
        throw new ValidationError('end_time must be in HH:mm:ss format');
      }
    }

    return permissionRepository.update(updates.role_id, updates.door_group_id, updates);
  }

  async deletePermission(id) {
    return permissionRepository.delete(id);
  }

  async removeRolePermission(roleId, doorGroupId) {
    return permissionRepository.deleteByRoleAndDoorGroup(roleId, doorGroupId);
  }
}

module.exports = new DoorService();
