
/**
 * Utility to generate the correct Supabase Storage URL for domain logos.
 * Enforces the structure: .../domain-logos/{domainName}/{filename}
 * Ensures all returned URLs are absolute and use https.
 * Includes memoization to prevent redundant calculations.
 * 
 * @param {string} domainName - The domain name (e.g., "example.com")
 * @param {string} filenameOrUrl - The filename (e.g., "logo.png") or full URL
 * @returns {string} The complete, valid absolute Supabase Storage URL
 */

// Simple in-memory cache
const urlCache = new Map();

export const getSupabaseImageUrl = (domainName, filenameOrUrl) => {
  if (!domainName || !filenameOrUrl) {
    return null;
  }

  // Create a cache key
  const cacheKey = `${domainName}|${filenameOrUrl}`;
  
  // Return cached result if available
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
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
    
    // Cache and return
    urlCache.set(cacheKey, finalUrl);
    return finalUrl;
  }

  // Handle relative paths starting with /
  let filename = input;
  if (filename.startsWith('/')) {
    filename = filename.substring(1);
  }

  // Construct the standard path: bucket/domain/filename
  const result = `${BASE_URL}/${cleanDomain}/${filename}`;
  
  // Cache and return
  urlCache.set(cacheKey, result);
  return result;
};

export const clearUrlCache = () => {
  urlCache.clear();
};

export default getSupabaseImageUrl;
