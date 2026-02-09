
/**
 * Utility to generate the correct Supabase Storage URL for domain logos.
 * Enforces the structure: .../domain-logos/{domainName}/{filename}
 * Ensures all returned URLs are absolute and use https.
 * 
 * @param {string} domainName - The domain name (e.g., "example.com")
 * @param {string} filenameOrUrl - The filename (e.g., "logo.png") or full URL
 * @returns {string} The complete, valid absolute Supabase Storage URL
 */
export const getSupabaseImageUrl = (domainName, filenameOrUrl) => {
  if (!domainName || !filenameOrUrl) return '';

  // Constants
  const SUPABASE_PROJECT_ID = 'ahttbqbzhggfdqupfnus';
  const BUCKET_NAME = 'domain-logos';
  const BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

  // Clean inputs
  const cleanDomain = domainName.trim();
  const input = filenameOrUrl.trim();

  // If it's already a full URL, validate and return it
  if (input.startsWith('http://') || input.startsWith('https://')) {
    // Force HTTPS
    if (input.startsWith('http://')) {
      return input.replace('http://', 'https://');
    }
    return input;
  }

  // Handle relative paths starting with /
  let filename = input;
  if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }

  // If the filename contains path separators, assume it might be a full path within the bucket
  // Otherwise, construct the standard path: bucket/domain/filename
  // We prioritize the domain folder structure: domain-logos/example.com/logo.png
  
  return `${BASE_URL}/${cleanDomain}/${filename}`;
};

export default getSupabaseImageUrl;
