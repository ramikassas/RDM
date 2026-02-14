
/**
 * Helper to validate/fix absolute URLs
 * Ensures all URLs returned are fully qualified https://rdm.bz URLs
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://rdm.bz${url}`;
  return `https://rdm.bz/${url}`;
};

/**
 * Returns the correct Schema.org availability URL based on status
 * @param {string} status - The status of the domain (available, sold, pending)
 * @returns {string} - The Schema.org URL
 */
export const getAvailabilityUrl = (status) => {
  const s = status ? status.toLowerCase() : 'available';
  if (s === 'sold') return 'https://schema.org/SoldOut';
  if (s === 'pending') return 'https://schema.org/PreOrder';
  // Default to InStock for 'available' or any other status
  return 'https://schema.org/InStock';
};

/**
 * Generates the Organization schema with corrected social media links
 * @returns {Object} - Organization Schema object
 */
export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rare Domains Marketplace",
    "url": "https://rdm.bz",
    "logo": "https://rdm.bz/logo.png",
"sameAs": [
      "https://instagram.com/rami_kassas",
      "https://x.com/rami_kassas",
      "https://linkedin.com/in/rami-kassas",
      "https://wa.me/905313715417",
      "https://www.facebook.com/profile.php?id=61559777456490"
    ],
"contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@rdm.bz",
      "telephone": "+905313715417",
      "areaServed": "World",
      "availableLanguage": "English"
    }
  };
};

/**
 * Generates Breadcrumb schema with correct ordering and types
 * @param {string} domain - The name of the domain
 * @returns {Object} - BreadcrumbList Schema object
 */
export const generateBreadcrumbSchema = (domain) => {
  if (!domain) return null;
  const cleanDomain = domain.trim();
  
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Marketplace",
        "item": "https://rdm.bz/marketplace"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": cleanDomain,
        "item": `https://rdm.bz/domain/${cleanDomain}`
      }
    ]
  };
};

/**
 * Generates Product schema for a domain with strict validation and formatted types.
 * Supports backward compatibility if called with object as first argument.
 * 
 * @param {string|Object} domain - The domain name string OR the domain data object
 * @param {Object} [domainData] - The domain data object (if first arg is name)
 * @returns {Object} - Product Schema object
 */
export const generateDomainSchema = (domain, domainData) => {
  // Backward compatibility: handle if first arg is the data object
  let nameStr = domain;
  let dataObj = domainData;

  if (typeof domain === 'object' && domain !== null) {
    dataObj = domain;
    nameStr = dataObj.name;
  }
  
  // Defensive checks
  if (!nameStr) return null;
  const cleanName = nameStr.trim();
  const data = dataObj || {};

  // Data Preparation
  const description = data.description || `Premium domain ${cleanName} is available for immediate purchase.`;
  const image = ensureAbsoluteUrl(data.image || 'https://rdm.bz/default-domain-image.png');
  const url = ensureAbsoluteUrl(data.url || `https://rdm.bz/domain/${cleanName}`);
  const sku = data.sku || cleanName;
  
  // Price formatting: CRITICAL - MUST be a string per requirements
  const priceStr = String(data.price || '0');

  // Schema Construction
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": cleanName,
    "description": description,
    "image": image,
    "url": url,
    "sku": sku,
    "brand": {
      "@type": "Brand",
      "name": "Rare Domains Marketplace"
    },
    "offers": {
      "@type": "Offer",
      "price": priceStr,
      "priceCurrency": "USD",
      "availability": getAvailabilityUrl(data.status),
      "url": url
    },
    // Seller MUST be the complete Organization object
    "seller": getOrganizationSchema()
  };
};

// Export alias for compatibility
export const generateProductSchema = generateDomainSchema;
