
/**
 * Generates a standardized fallback description for a domain when no custom description is provided.
 * @param {string} domainName - The name of the domain
 * @returns {string} The auto-generated description
 */
export const generateAutoDescription = (domainName) => {
  if (!domainName) return '';
  return `${domainName} is a high-value, premium domain name now available for acquisition.`;
};
