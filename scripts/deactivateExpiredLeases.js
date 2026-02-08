require('dotenv').config();
const supabase = require('../src/config/database');
const logger = require('../src/config/logger');

/**
 * Script to deactivate access cards for employees in organizations with expired leases
 */

async function deactivateExpiredLeases() {
  try {
    logger.info('Starting expired lease deactivation process...');

    // 1. Find all expired leases
    const today = new Date().toISOString().split('T')[0];
    const { data: expiredLeases, error: leaseError } = await supabase
      .from('lease')
      .select('id, organization_id, end_date')
      .lt('end_date', today);

    if (leaseError) {
      throw leaseError;
    }

    if (!expiredLeases || expiredLeases.length === 0) {
      logger.info('No expired leases found');
      return;
    }

    logger.info(`Found ${expiredLeases.length} expired lease(s)`);

    // 2. Get unique organization IDs
    const orgIds = [...new Set(expiredLeases.map(lease => lease.organization_id))];
    logger.info(`Affected organizations: ${orgIds.length}`);

    // 3. Find all active employees in these organizations
    const { data: employees, error: empError } = await supabase
      .from('employee')
      .select('id, name, organization_id')
      .in('organization_id', orgIds)
      .eq('status', 'ACTIVE');

    if (empError) {
      throw empError;
    }

    if (!employees || employees.length === 0) {
      logger.info('No active employees found in organizations with expired leases');
      return;
    }

    logger.info(`Found ${employees.length} active employee(s) to deactivate`);

    // 4. Get employee IDs
    const employeeIds = employees.map(emp => emp.id);

    // 5. Mark access cards as INACTIVE
    const { data: updatedCards, error: cardError } = await supabase
      .from('access_card')
      .update({ status: 'INACTIVE' })
      .in('employee_id', employeeIds)
      .eq('status', 'ACTIVE')
      .select();

    if (cardError) {
      throw cardError;
    }

    logger.info(`Deactivated ${updatedCards?.length || 0} access card(s)`);

    // 6. Log details
    logger.info('\n=== Deactivation Summary ===');
    for (const employee of employees) {
      const lease = expiredLeases.find(l => l.organization_id === employee.organization_id);
      logger.info(`- ${employee.name} (Lease expired: ${lease?.end_date})`);
    }

    logger.info('\n✅ Expired lease deactivation completed successfully!');

  } catch (error) {
    logger.error('❌ Deactivation failed:', error);
    process.exit(1);
  }
}

// Run the script
deactivateExpiredLeases()
  .then(() => process.exit(0))
  .catch(error => {
    logger.error('Fatal error:', error);
    process.exit(1);
  });
