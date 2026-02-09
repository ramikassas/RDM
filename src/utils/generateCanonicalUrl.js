/**
 * Generates a strictly formatted canonical URL.
 * Enforces: Lowercase, No trailing slash, Absolute URL, No query params.
 * 
 * @param {string} pathname - The current path (e.g. /domain/Test.com?q=123)
 * @returns {string} - The optimized absolute URL (e.g. https://rdm.bz/domain/test.com)
 */
export const generateCanonicalUrl = (pathname) => {
  const baseUrl = 'https://rdm.bz';
  
  if (!pathname) return baseUrl;

  // 1. Remove query parameters if present (Task 1.5)
  // Even if input is just pathname, this is defensive
  let path = pathname.split('?')[0];

  // 2. Ensure starts with /
  path = path.startsWith('/') ? path : `/${path}`;

  // 3. Decode URI component to handle encoded chars
  try {
    path = decodeURIComponent(path);
  } catch (e) {
    // if decode fails, keep original
  }

  // 4. Lowercase everything (Task 1.3)
  path = path.toLowerCase();

  // 5. Remove trailing slash (unless root) (Task 1.4)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 6. Return absolute URL with prefix (Task 1.1, 1.2, 1.6)
  return `${baseUrl}${path}`;
};
