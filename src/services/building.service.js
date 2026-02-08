const buildingRepository = require('../repositories/building.repository');
const { ValidationError } = require('../utils/errors');

class BuildingService {
  async createBuilding(buildingData) {
    // Validate timezone
    if (!buildingData.timezone) {
      buildingData.timezone = 'UTC';
    }

    return buildingRepository.create(buildingData);
  }

  async getAllBuildings() {
    return buildingRepository.findAll();
  }

  async getBuildingById(id) {
    return buildingRepository.findById(id);
  }

  async updateBuilding(id, updates) {
    return buildingRepository.update(id, updates);
  }

  async deleteBuilding(id) {
    return buildingRepository.delete(id);
  }

  // Floor operations
  async createFloor(floorData) {
    // Validate building exists
    await buildingRepository.findById(floorData.building_id);

    return buildingRepository.createFloor(floorData);
  }

  async getFloorsByBuilding(buildingId) {
    return buildingRepository.findFloorsByBuilding(buildingId);
  }

  async getFloorById(id) {
    return buildingRepository.findFloorById(id);
  }

  // Office Space operations
  async createOfficeSpace(spaceData) {
    // Validate floor exists
    await buildingRepository.findFloorById(spaceData.floor_id);

    return buildingRepository.createOfficeSpace(spaceData);
  }

  async getOfficeSpacesByFloor(floorId) {
    return buildingRepository.findOfficeSpacesByFloor(floorId);
  }

  async getOfficeSpaceById(id) {
    return buildingRepository.findOfficeSpaceById(id);
  }
}

module.exports = new BuildingService();
