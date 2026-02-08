
/**
 * Generates a strictly formatted canonical URL.
 * Enforces: Lowercase, No trailing slash, Absolute URL, No query params.
 * 
 * @param {string} pathname - The current path (e.g. /domain/Test.com)
 * @returns {string} - The optimized canonical URL
 */
export const generateCanonicalUrl = (pathname) => {
  const baseUrl = 'https://rdm.bz';
  
  if (!pathname) return baseUrl;

  // 1. Ensure starts with /
  let path = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // 2. Decode URI component to handle encoded chars
  try {
    path = decodeURIComponent(path);
  } catch (e) {
    // if decode fails, keep original
  }

  // 3. Lowercase everything for consistency (domains are case-insensitive)
  // NOTE: Be careful if you have case-sensitive routes that aren't domains. 
  // For this app, domains are the primary dynamic segment.
  path = path.toLowerCase();

  // 4. Remove trailing slash (unless root)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 5. Construct absolute URL
  return `${baseUrl}${path}`;
};
