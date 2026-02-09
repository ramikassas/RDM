
/**
 * Utility function to check if a domain is sold.
 * Case-insensitive check against 'sold' status.
 * 
 * @param {Object} domain - The domain object to check
 * @param {string} domain.status - The status string of the domain
 * @returns {boolean} - True if status is 'sold', false otherwise
 */
export const isDomainSold = (domain) => {
  if (!domain || !domain.status) return false;
  return domain.status.toLowerCase() === 'sold';
};
