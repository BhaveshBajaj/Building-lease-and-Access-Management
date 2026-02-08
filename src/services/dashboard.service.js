const organizationRepository = require('../repositories/organization.repository');
const employeeRepository = require('../repositories/employee.repository');
const buildingRepository = require('../repositories/building.repository');

class DashboardService {
  async getDashboardStats() {
    // Get counts in parallel for efficiency
    const [organizations, employees, buildings] = await Promise.all([
      organizationRepository.findAll(),
      employeeRepository.findAll({}),
      buildingRepository.findAll()
    ]);

    // Get active employees count
    const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');

    return {
      totalOrganizations: organizations.length,
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: employees.length - activeEmployees.length,
      totalBuildings: buildings.length
    };
  }

  async getOrganizationStats(organizationId) {
    const [employees, leases] = await Promise.all([
      employeeRepository.findByOrganization(organizationId),
      organizationRepository.findLeasesByOrganization(organizationId)
    ]);

    const activeEmployees = employees.filter(emp => emp.status === 'ACTIVE');
    const activeLeases = leases.filter(lease => {
      const now = new Date();
      return new Date(lease.start_date) <= now && new Date(lease.end_date) >= now;
    });

    return {
      organizationId,
      totalEmployees: employees.length,
      activeEmployees: activeEmployees.length,
      inactiveEmployees: employees.length - activeEmployees.length,
      totalLeases: leases.length,
      activeLeases: activeLeases.length,
      expiredLeases: leases.length - activeLeases.length
    };
  }
}

module.exports = new DashboardService();
