const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Time helper utilities for handling timezone-aware time validation
 */
class TimeHelper {
  /**
   * Check if current time in building's timezone falls within start_time and end_time
   * @param {string} buildingTimezone - IANA timezone string (e.g., 'America/New_York')
   * @param {string} startTime - Time string in HH:mm:ss format (e.g., '09:00:00')
   * @param {string} endTime - Time string in HH:mm:ss format (e.g., '17:00:00')
   * @returns {boolean} - True if current time is within range
   */
  static isWithinTimeRange(buildingTimezone, startTime, endTime) {
    if (!startTime || !endTime) {
      return true; // No time restriction
    }

    const now = dayjs().tz(buildingTimezone);
    const currentTime = now.format('HH:mm:ss');

    // Handle overnight time ranges (e.g., 22:00:00 to 06:00:00)
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }

    // Normal same-day range
    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Get current time in a specific timezone
   * @param {string} timezone - IANA timezone string
   * @returns {string} - Current time in HH:mm:ss format
   */
  static getCurrentTimeInTimezone(timezone) {
    return dayjs().tz(timezone).format('HH:mm:ss');
  }

  /**
   * Validate time string format (HH:mm:ss)
   * @param {string} timeString - Time string to validate
   * @returns {boolean} - True if valid format
   */
  static isValidTimeFormat(timeString) {
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    return timeRegex.test(timeString);
  }

  /**
   * Get current timestamp in ISO format
   * @returns {string} - ISO timestamp
   */
  static now() {
    return dayjs().toISOString();
  }

  /**
   * Format date to ISO string
   * @param {Date|string} date - Date to format
   * @returns {string} - ISO formatted date
   */
  static toISO(date) {
    return dayjs(date).toISOString();
  }

  /**
   * Check if a date is in the past
   * @param {Date|string} date - Date to check
   * @returns {boolean} - True if date is in the past
   */
  static isPast(date) {
    return dayjs(date).isBefore(dayjs());
  }

  /**
   * Check if a date is in the future
   * @param {Date|string} date - Date to check
   * @returns {boolean} - True if date is in the future
   */
  static isFuture(date) {
    return dayjs(date).isAfter(dayjs());
  }
}

module.exports = TimeHelper;
