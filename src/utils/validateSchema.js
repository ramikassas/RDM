
/**
 * Validates a Product Schema object against Google's Structured Data requirements.
 * @param {Object} schema - The generated JSON-LD object
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateSchema = (schema) => {
  const errors = [];

  if (!schema) {
    return { isValid: false, errors: ['Schema object is null or undefined'] };
  }

  // 1. Required Top Level Fields
  if (schema['@type'] !== 'Product') errors.push("Missing or invalid @type (must be 'Product')");
  if (!schema.name) errors.push("Missing required field: name");
  if (!schema.description) errors.push("Missing required field: description");
  if (!schema.image) errors.push("Missing required field: image");
  
  // 2. Offers Validation
  if (!schema.offers) {
    errors.push("Missing required field: offers");
  } else {
    const offer = schema.offers;
    if (offer['@type'] !== 'Offer') errors.push("Offer must have @type 'Offer'");
    
    // Price checks
    if (offer.price === undefined || offer.price === null || offer.price === '') {
      errors.push("Missing required field: offers.price");
    } else if (isNaN(parseFloat(offer.price))) {
      errors.push("offers.price must be a numeric value/string");
    }

    if (!offer.priceCurrency) errors.push("Missing required field: offers.priceCurrency");
    
    // Availability checks
    const validAvailability = [
      'https://schema.org/InStock',
      'https://schema.org/SoldOut',
      'https://schema.org/PreOrder',
      'https://schema.org/OutOfStock'
    ];
    if (!validAvailability.includes(offer.availability)) {
      errors.push(`Invalid availability URL: ${offer.availability}`);
    }
  }

  // 3. URL Format Checks
  const urlFields = ['url', 'image'];
  urlFields.forEach(field => {
    if (schema[field] && !schema[field].startsWith('http')) {
      errors.push(`Field '${field}' must be an absolute URL starting with http/https`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
