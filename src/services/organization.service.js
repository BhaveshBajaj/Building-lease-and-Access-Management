const organizationRepository = require('../repositories/organization.repository');
const buildingRepository = require('../repositories/building.repository');
const { ValidationError } = require('../utils/errors');

class OrganizationService {
  async createOrganization(orgData) {
    return organizationRepository.create(orgData);
  }

  async getAllOrganizations() {
    return organizationRepository.findAll();
  }

  async getOrganizationById(id) {
    return organizationRepository.findById(id);
  }

  async updateOrganization(id, updates) {
    return organizationRepository.update(id, updates);
  }

  async deleteOrganization(id) {
    return organizationRepository.delete(id);
  }

  // Lease operations
  async createLease(leaseData) {
    // Validate organization exists
    await organizationRepository.findById(leaseData.organization_id);

    // Validate office space exists
    await buildingRepository.findOfficeSpaceById(leaseData.office_space_id);

    // Validate dates
    const startDate = new Date(leaseData.start_date);
    const endDate = new Date(leaseData.end_date);

    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date');
    }

    return organizationRepository.createLease(leaseData);
  }

  async getLeasesByOrganization(organizationId) {
    return organizationRepository.findLeasesByOrganization(organizationId);
  }

  async getLeaseById(id) {
    return organizationRepository.findLeaseById(id);
  }

  async getExpiredLeases() {
    return organizationRepository.findExpiredLeases();
  }

  async getActiveLeases(organizationId) {
    return organizationRepository.findActiveLeasesByOrganization(organizationId);
  }

  async getOfficeSpacesForOrganization(organizationId, filters = {}) {
    const spaces = await buildingRepository.findOfficeSpacesWithLeases();
    const today = new Date().toISOString().split('T')[0];

    const decorated = spaces.map((space) => {
      const leases = space.leases || [];
      const activeLease = leases.find(
        (lease) => lease.start_date <= today && lease.end_date >= today
      );

      return {
        ...space,
        activeLease: activeLease || null,
        isAvailable: !activeLease,
        isLeasedByOrganization: !!activeLease && activeLease.organization_id === organizationId
      };
    });

    let result = decorated;

    if (filters.floor_id) {
      result = result.filter((space) => space.floor_id === filters.floor_id);
    }

    if (filters.building_id) {
      result = result.filter((space) => space.floor?.building?.id === filters.building_id);
    }

    if (filters.availability === 'available') {
      result = result.filter((space) => space.isAvailable);
    } else if (filters.availability === 'leased') {
      result = result.filter((space) => !space.isAvailable);
    }

    if (filters.assigned === 'mine') {
      result = result.filter((space) => space.isLeasedByOrganization);
    } else if (filters.assigned === 'others') {
      result = result.filter((space) => !space.isAvailable && !space.isLeasedByOrganization);
    }

    return result;
  }
}

module.exports = new OrganizationService();
