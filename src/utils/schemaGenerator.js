
/**
 * Generates a standard JSON-LD Product schema for a domain.
 * @param {Object} data - The domain data
 * @param {string} data.name - Domain name
 * @param {string} [data.description] - Description of the domain
 * @param {string} [data.image] - URL to the domain logo or social image
 * @param {string} [data.url] - Canonical URL of the domain detail page
 * @param {number} [data.price] - Price of the domain
 * @param {string} [data.status] - Status (available, sold, etc.)
 * @param {string} [data.currency] - Currency code (default: USD)
 * @returns {Object} JSON-LD Schema object
 */
export const generateDomainSchema = ({
  name,
  description,
  image,
  url,
  price,
  status = 'available',
  currency = 'USD'
}) => {
  if (!name) return null;

  // Fallbacks
  const schemaDescription = description || `Premium domain name ${name} is available for sale. Secure this digital asset today.`;
  const schemaImage = image || 'https://rdm.bz/og-image.png';
  const schemaUrl = url || `https://rdm.bz/domain/${name}`;
  
  const isAvailable = status === 'available';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": schemaDescription,
    "image": schemaImage,
    "url": schemaUrl,
    "sku": name,
    "category": "Domain Names",
    "offers": {
      "@type": "Offer",
      "priceCurrency": currency,
      "price": price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Rare Domains Marketplace (RDM)",
        "url": "https://rdm.bz"
      }
    }
  };

  // Include top-level price properties for broader compatibility
  if (price !== undefined && price !== null) {
    schema.price = price;
    schema.priceCurrency = currency;
  }

  return schema;
};
