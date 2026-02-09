/**
 * Helper to validate/fix absolute URLs
 */
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://rdm.bz${url}`;
  return `https://rdm.bz/${url}`;
};

/**
 * Generates a standard JSON-LD Organization schema for the brand
 */
export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rare Domains Marketplace (RDM)",
    "url": "https://rdm.bz",
    "logo": "https://rdm.bz/logo.png",
    "sameAs": [
      "https://instagram.com/rami_kassas",
      "https://x.com/rami_kassas"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@rdm.bz"
    }
  };
};

/**
 * Generates a standard JSON-LD Breadcrumb schema
 * @param {string} domainName - The name of the domain
 * @returns {Object} JSON-LD Schema object
 */
export const generateBreadcrumbSchema = (domainName) => {
  const cleanName = domainName ? domainName.trim() : '';
  if (!cleanName) return null;

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
        "name": cleanName,
        "item": `https://rdm.bz/domain/${cleanName}`
      }
    ]
  };
};

/**
 * Generates a standard JSON-LD Product schema for a domain with strict validation.
 * @param {Object} domainData - The domain data object
 * @returns {Object} JSON-LD Schema object or null if invalid
 */
export const generateDomainSchema = (domainData) => {
  // Defensive check: ensure domainData exists and has a name
  if (!domainData || !domainData.name) return null;

  // 1. Strict Data Preparation & Defensive Fallbacks
  const cleanName = domainData.name.trim();

  // Description Fallback
  const rawDescription = domainData.description || 'Premium domain available for purchase';
  const cleanDescription = rawDescription.replace(/"/g, '&quot;');
  
  // Image Fallback
  const rawImage = domainData.image || 'https://rdm.bz/default-domain-image.png';
  const cleanImage = ensureAbsoluteUrl(rawImage);
  
  // URL Construction
  const rawUrl = domainData.url || `https://rdm.bz/domain/${cleanName}`;
  const cleanUrl = ensureAbsoluteUrl(rawUrl);

  // Price Validation & Fallback
  let cleanPrice = domainData.price ? String(domainData.price) : '0';
  // Additional safety: remove currency symbols if accidentally passed
  cleanPrice = cleanPrice.replace(/[^0-9.]/g, ''); 
  if (isNaN(parseFloat(cleanPrice))) cleanPrice = "0";

  // Category Fallback
  const cleanCategory = Array.isArray(domainData.category) 
    ? domainData.category[0] 
    : (domainData.category || 'Domain Names');

  // SKU Fallback
  const cleanSku = domainData.sku || cleanName || 'unknown';

  // Availability Mapping
  const status = domainData.status || 'available';
  let cleanAvailability = 'https://schema.org/InStock';
  const statusLower = status.toLowerCase();

  if (statusLower === 'sold' || statusLower === 'unavailable') {
    cleanAvailability = 'https://schema.org/OutOfStock';
  } else if (statusLower === 'pending') {
    cleanAvailability = 'https://schema.org/PreOrder';
  }

  // 2. Schema Construction
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": cleanName,
    "description": cleanDescription,
    "image": cleanImage,
    "url": cleanUrl,
    "sku": cleanSku,
    "brand": {
      "@type": "Brand",
      "name": cleanName
    },
    "category": cleanCategory,
    "offers": {
      "@type": "Offer",
      "price": cleanPrice,
      "priceCurrency": "USD",
      "availability": cleanAvailability,
      "url": cleanUrl,
      "seller": {
        "@type": "Organization",
        "name": "Rare Domains Marketplace (RDM)",
        "url": "https://rdm.bz",
        "logo": "https://rdm.bz/logo.png",
        "sameAs": [
          "https://instagram.com/rami_kassas",
          "https://x.com/rami_kassas"
        ]
      }
    }
  };

  return schema;
};

// Alias export for compatibility if referenced as generateProductSchema
export const generateProductSchema = generateDomainSchema;
