const cardRepository = require('../repositories/card.repository');
const doorRepository = require('../repositories/door.repository');
const permissionRepository = require('../repositories/permission.repository');
const accessLogRepository = require('../repositories/accessLog.repository');
const TimeHelper = require('../utils/timeHelper');
const logger = require('../config/logger');

/**
 * Core access verification service
 * Implements 6-step verification logic for card-door access
 */
class AccessVerificationService {
  /**
   * Verify if a card can access a door
   * @param {string} cardUid - RFID card UID
   * @param {string} doorId - Door ID
   * @returns {Promise<{status: 'GRANTED'|'DENIED', message: string, timestamp: string, denial_reason?: string}>}
   */
  async verifyAccess(cardUid, doorId) {
    const timestamp = TimeHelper.now();
    let denialReason = null;
    let status = 'DENIED';

    try {
      // Step 1: Find card and validate status
      const card = await cardRepository.findByUid(cardUid);
      
      if (!card) {
        denialReason = 'Card not found';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      if (card.status !== 'ACTIVE') {
        denialReason = `Card is ${card.status}`;
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      // Step 2: Get employee and validate status
      const employee = card.employee;
      
      if (!employee) {
        denialReason = 'Employee not found';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      if (employee.status !== 'ACTIVE') {
        denialReason = 'Employee is inactive';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      // Step 3: Get employee's role
      const role = employee.role;
      
      if (!role) {
        denialReason = 'Employee has no role assigned';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      // Step 4: Find door and its groups
      const door = await doorRepository.findDoorById(doorId);
      
      if (!door) {
        denialReason = 'Door not found';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      // Extract door groups from nested structure
      const doorGroups = door.door_groups?.map(dg => dg.door_group) || [];
      
      if (doorGroups.length === 0) {
        denialReason = 'Door has no groups assigned';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      const doorGroupIds = doorGroups.map(dg => dg.id);

      // Step 5: Check if role has permission to any of the door's groups
      const permissions = await permissionRepository.checkRolePermission(role.id, doorGroupIds);
      
      if (!permissions || permissions.length === 0) {
        denialReason = 'No permission for this door';
        await this.logAccess(cardUid, doorId, status, denialReason);
        return { status, message: denialReason, timestamp };
      }

      // Step 6: Check time restrictions
      const buildingTimezone = door.floor?.building?.timezone || 'UTC';
      
      for (const permission of permissions) {
        if (permission.access_type === 'ALWAYS') {
          // Access granted - no time restriction
          status = 'GRANTED';
          await this.logAccess(cardUid, doorId, status, null);
          
          logger.info(`Access GRANTED: Card ${cardUid} to door ${doorId} (${employee.name}, ${role.name})`);
          
          return {
            status: 'GRANTED',
            message: 'Access granted',
            timestamp,
            employee: {
              name: employee.name,
              role: role.name
            }
          };
        }

        if (permission.access_type === 'TIME_BOUND') {
          const withinTimeRange = TimeHelper.isWithinTimeRange(
            buildingTimezone,
            permission.start_time,
            permission.end_time
          );

          if (withinTimeRange) {
            status = 'GRANTED';
            await this.logAccess(cardUid, doorId, status, null);
            
            logger.info(`Access GRANTED: Card ${cardUid} to door ${doorId} (${employee.name}, ${role.name}, time-bound)`);
            
            return {
              status: 'GRANTED',
              message: 'Access granted (time-bound)',
              timestamp,
              employee: {
                name: employee.name,
                role: role.name
              }
            };
          }
        }
      }

      // If we reach here, time restrictions were not met
      denialReason = 'Outside permitted time range';
      await this.logAccess(cardUid, doorId, status, denialReason);
      
      logger.warn(`Access DENIED: Card ${cardUid} to door ${doorId} - ${denialReason}`);
      
      return {
        status: 'DENIED',
        message: denialReason,
        timestamp
      };

    } catch (error) {
      logger.error('Access verification error:', error);
      denialReason = 'System error during verification';
      
      // Still log the attempt even on error
      try {
        await this.logAccess(cardUid, doorId, 'DENIED', denialReason);
      } catch (logError) {
        logger.error('Failed to log access attempt:', logError);
      }
      
      return {
        status: 'DENIED',
        message: 'System error',
        timestamp
      };
    }
  }

  /**
   * Log access attempt
   */
  async logAccess(cardUid, doorId, status, denialReason = null) {
    try {
      await accessLogRepository.create({
        card_uid: cardUid,
        door_id: doorId,
        status,
        denial_reason: denialReason,
        timestamp: TimeHelper.now()
      });
    } catch (error) {
      logger.error('Failed to create access log:', error);
      // Don't throw - logging failure shouldn't block access verification
    }
  }

  /**
   * Get access logs with filters
   */
  async getAccessLogs(filters, pagination) {
    return accessLogRepository.findAll(filters, pagination);
  }

  /**
   * Get access statistics
   */
  async getAccessStats(filters) {
    return accessLogRepository.getAccessStats(filters);
  }

  /**
   * Get denied access attempts
   */
  async getDeniedAttempts(filters, limit = 100) {
    return accessLogRepository.findDeniedAttempts(filters, limit);
  }
}

module.exports = new AccessVerificationService();
