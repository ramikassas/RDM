
/**
 * Formats a date string, timestamp, or Date object into a readable string.
 * Uses strict string construction to avoid RTL characters and locale inconsistencies.
 * 
 * @param {string|number|Date} date - The date to format
 * @returns {string} - Formatted date string "DD/MM/YYYY HH:MM" or "N/A"
 */

export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Formats a date string, timestamp, or Date object into a date-only string.
 * 
 * @param {string|number|Date} date - The date to format
 * @returns {string} - Formatted date string "DD/MM/YYYY" or "N/A"
 */
export const formatDateOnly = (date) => {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Formats a date string, timestamp, or Date object into a time-only string.
 * 
 * @param {string|number|Date} date - The date to format
 * @returns {string} - Formatted time string "HH:MM" or "N/A"
 */
export const formatTimeOnly = (date) => {
  if (!date) return 'N/A';
  
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};
