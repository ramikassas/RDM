
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
  // LOGGING - Task 1B
  // console.log('getSupabaseImageUrl input:', {domainName, filenameOrUrl});

  if (!domainName || !filenameOrUrl) {
    // console.log('getSupabaseImageUrl output: null (missing input)');
    return null;
  }

  // Constants
  const SUPABASE_PROJECT_ID = 'ahttbqbzhggfdqupfnus';
  const BUCKET_NAME = 'domain-logos';
  const BASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

  // Clean inputs
  const cleanDomain = domainName.trim();
  const input = filenameOrUrl.trim();

  // If it's already a full URL, validate and return it
  if (input.startsWith('http://') || input.startsWith('https://')) {
    let finalUrl = input;
    // Force HTTPS
    if (input.startsWith('http://')) {
      finalUrl = input.replace('http://', 'https://');
    }
    // console.log('getSupabaseImageUrl output (full URL):', finalUrl);
    return finalUrl;
  }

  // Handle relative paths starting with /
  let filename = input;
  if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }

  // Construct the standard path: bucket/domain/filename
  const result = `${BASE_URL}/${cleanDomain}/${filename}`;
  // console.log('getSupabaseImageUrl output (constructed):', result);
  return result;
};

export default getSupabaseImageUrl;
