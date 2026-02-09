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
 * Generates a standard JSON-LD Product schema for a domain with strict validation.
 * @param {Object} domainData - The domain data object
 * @returns {Object} JSON-LD Schema object or null if invalid
 */
export const generateDomainSchema = (domainData) => {
  // Defensive check: ensure domainData exists and has a name
  if (!domainData || !domainData.name) return null;

  // 1. Strict Data Preparation & Defensive Fallbacks (Task 3)
  const cleanName = domainData.name.trim();

  // Description Fallback (Task 3.3)
  const rawDescription = domainData.description || 'Premium domain available for purchase';
  const cleanDescription = rawDescription.replace(/"/g, '&quot;');
  
  // Image Fallback (Task 3.4)
  const rawImage = domainData.image || 'https://rdm.bz/default-domain-image.png';
  const cleanImage = ensureAbsoluteUrl(rawImage);
  
  // URL Construction
  const rawUrl = domainData.url || `https://rdm.bz/domain/${cleanName}`;
  const cleanUrl = ensureAbsoluteUrl(rawUrl);

  // Price Validation & Fallback (Task 3.1)
  let cleanPrice = domainData.price ? String(domainData.price) : '0';
  // Additional safety: remove currency symbols if accidentally passed
  cleanPrice = cleanPrice.replace(/[^0-9.]/g, ''); 
  if (isNaN(parseFloat(cleanPrice))) cleanPrice = "0";

  // Category Fallback (Task 3.2)
  const cleanCategory = Array.isArray(domainData.category) 
    ? domainData.category[0] 
    : (domainData.category || 'Domain Names');

  // SKU Fallback (Task 3.5)
  const cleanSku = domainData.sku || cleanName || 'unknown';

  // Availability Mapping
  const status = domainData.status || 'available';
  let cleanAvailability = 'https://schema.org/InStock';
  const statusLower = status.toLowerCase();

  if (statusLower === 'sold') {
    cleanAvailability = 'https://schema.org/SoldOut';
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
      "priceCurrency": domainData.currency || "USD",
      "price": cleanPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": cleanAvailability,
      "url": cleanUrl,
      "seller": {
        "@type": "Organization",
        "name": "Rare Domains Marketplace (RDM)",
        "url": "https://rdm.bz",
        "logo": "https://rdm.bz/logo.png",
        // Task 2: Organization Social Media Updates
        "sameAs": [
          "https://instagram.com/rami_kassas",
          "https://x.com/rami_kassas"
        ]
      }
    }
  };

  return schema;
};
