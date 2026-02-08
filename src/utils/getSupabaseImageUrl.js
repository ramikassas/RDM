
/**
 * Utility to generate the correct Supabase Storage URL for domain logos.
 * Enforces the structure: .../domain-logos/{domainName}/{filename}
 * 
 * @param {string} domainName - The domain name (e.g., "example.com")
 * @param {string} filenameOrUrl - The filename (e.g., "logo.png") or full URL
 * @returns {string} The complete, valid Supabase Storage URL
 */
export const getSupabaseImageUrl = (domainName, filenameOrUrl) => {
  if (!domainName || !filenameOrUrl) return '';

  const SUPABASE_PROJECT_ID = 'ahttbqbzhggfdqupfnus';
  const BUCKET_NAME = 'domain-logos';
  const BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

  // Clean the domain name (remove trailing slashes, spaces)
  const cleanDomain = domainName.trim();

  // Extract filename if a full URL is provided
  let filename = filenameOrUrl;
  
  // Check if it's already a URL
  if (filenameOrUrl.startsWith('http')) {
    // If it's already the correct Supabase URL format for this domain, return it
    if (filenameOrUrl.includes(`${BASE_URL}/${cleanDomain}/`)) {
      return filenameOrUrl;
    }
    
    // Otherwise, try to extract the filename from the end
    // This handles cases where we want to normalize the path
    const parts = filenameOrUrl.split('/');
    filename = parts[parts.length - 1];
  }

  // Ensure filename doesn't start with a slash
  if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }

  // Construct the standardized URL
  // NOTE: This assumes files are stored in a folder named after the domain
  return `${BASE_URL}/${cleanDomain}/${filename}`;
};

export default getSupabaseImageUrl;
