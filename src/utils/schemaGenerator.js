
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
 * Generates a standard JSON-LD Product schema for a domain with strict validation.
 * @param {Object} data - The domain data
 * @param {string} data.name - Domain name (Required)
 * @param {string} [data.description] - Description of the domain
 * @param {string} [data.image] - URL to the domain logo or social image
 * @param {string} [data.url] - Canonical URL of the domain detail page
 * @param {number} [data.price] - Price of the domain
 * @param {string} [data.status] - Status (available, sold, etc.)
 * @param {string} [data.currency] - Currency code (default: USD)
 * @param {string} [data.category] - Domain category
 * @returns {Object} JSON-LD Schema object or null if invalid
 */
export const generateDomainSchema = ({
  name,
  description,
  image,
  url,
  price,
  status = 'available',
  currency = 'USD',
  category = 'Domain Names'
}) => {
  if (!name) return null;

  // 1. Strict Data Preparation
  const cleanName = name.trim();
  const cleanDescription = (description || `Premium domain name ${cleanName} is available for sale.`).replace(/"/g, '&quot;');
  
  // Ensure absolute URLs
  const cleanImage = image ? ensureAbsoluteUrl(image) : 'https://rdm.bz/og-image.png';
  const cleanUrl = url ? ensureAbsoluteUrl(url) : `https://rdm.bz/domain/${cleanName}`;

  // Price validation: strictly numeric string, no currency symbols
  let cleanPrice = "0";
  if (price !== undefined && price !== null) {
      // Remove $ or , if accidentally passed as string
      cleanPrice = String(price).replace(/[^0-9.]/g, '');
      if (isNaN(parseFloat(cleanPrice))) cleanPrice = "0";
  }

  // Availability mapping
  // If domain.status === "available": set availability to "https://schema.org/InStock"
  // If domain.status === "sold": set availability to "https://schema.org/SoldOut"
  // If domain.status === "pending": set availability to "https://schema.org/PreOrder"
  // Default to "https://schema.org/InStock" for any other status
  let cleanAvailability = 'https://schema.org/InStock';
  const statusLower = status?.toLowerCase();

  if (statusLower === 'sold') {
    cleanAvailability = 'https://schema.org/SoldOut';
  } else if (statusLower === 'pending') {
    cleanAvailability = 'https://schema.org/PreOrder';
  }

  // 2. Schema Construction - SINGLE CLEAN PRODUCT SCHEMA
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": cleanName,
    "description": cleanDescription,
    "image": cleanImage,
    "url": cleanUrl,
    "sku": cleanName,
    "brand": {
      "@type": "Brand",
      "name": cleanName
    },
    "category": category || "Domain Names",
    "offers": {
      "@type": "Offer",
      "priceCurrency": currency || "USD",
      "price": cleanPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": cleanAvailability,
      "url": cleanUrl,
      "seller": {
        "@type": "Organization",
        "name": "Rare Domains Marketplace (RDM)",
        "url": "https://rdm.bz",
        "logo": "https://rdm.bz/logo.png"
      }
    }
  };

  return schema;
};
