
/**
 * Detects the character pattern of a domain (e.g., CVC, VCV).
 * @param {string} domain - The domain name (without extension)
 * @returns {string} - The detected pattern (e.g., "CVC") or null if no specific pattern.
 */
const detectPattern = (domain) => {
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const name = domain.split('.')[0].toLowerCase();
  
  if (name.length > 5) return null; // Only detect patterns for short domains

  let pattern = '';
  for (let char of name) {
    if (vowels.includes(char)) {
      pattern += 'V';
    } else if (char >= '0' && char <= '9') {
      pattern += 'N';
    } else {
      pattern += 'C'; // Consonant
    }
  }
  return pattern;
};

/**
 * Generates a smart, SEO-optimized title for a domain page.
 * @param {string} domainName - The full domain name (e.g., "example.com")
 * @param {string} category - The domain category
 * @param {string} [tld] - Top level domain (e.g., ".com")
 * @returns {string} - Optimized title string (max 60 chars)
 */
export const generateSmartTitle = (domainName, category = "General", tld = ".com") => {
  if (!domainName) return "Premium Domain for Sale | RDM";

  const nameOnly = domainName.split('.')[0];
  const length = nameOnly.length;
  const pattern = detectPattern(domainName);
  const suffix = " | RDM";
  const maxLen = 60 - suffix.length;

  let baseTitle = "";

  // Strategy 1: Short Domains (<= 5 chars) with Pattern
  if (length <= 4 && pattern) {
    // E.g., "aba.com - Premium CVC Domain for Sale"
    baseTitle = `${domainName} - Premium ${pattern} Domain for Sale`;
  } 
  // Strategy 2: Short Domains without specific pattern
  else if (length <= 5) {
     baseTitle = `${domainName} - Premium Short Domain for Sale`;
  }
  // Strategy 3: Long Brandable Domains
  else {
    // E.g., "superstart.com - Brandable Tech Domain"
    // Clean category name (remove 'Domains' if present to save space)
    const cleanCategory = category.replace(/Domains?/i, '').trim();
    baseTitle = `${domainName} - Brandable ${cleanCategory} Domain`;
  }

  // Truncate if necessary to ensure it fits with suffix
  if (baseTitle.length > maxLen) {
    // Fallback strategy if too long: just Name + Type
    baseTitle = `${domainName} - Premium Domain for Sale`;
  }

  // Absolute fallback if still too long
  if (baseTitle.length > maxLen) {
    baseTitle = `${domainName} - Premium Domain`;
  }

  return `${baseTitle}${suffix}`;
};
