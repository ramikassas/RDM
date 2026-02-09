
/**
 * Utility functions for detecting and handling Unstoppable Domains
 * extensions: .agi, .robot, .web3
 */

export const isUnstoppableDomain = (domainName) => {
  if (!domainName) return false;
  const lowerName = domainName.toLowerCase();
  return lowerName.endsWith('.agi') || lowerName.endsWith('.robot') || lowerName.endsWith('.web3');
};

export const getUnstoppableDomainsUrl = (domainName) => {
  if (!domainName) return '';
  // According to specs: https://unstoppabledomains.com/d/{domainName}
  return `https://unstoppabledomains.com/d/${domainName}`;
};
