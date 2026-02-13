
import { SOCIAL_MEDIA_PLATFORMS } from '@/config/SOCIAL_MEDIA_PLATFORMS';

/**
 * Validates and formats a social media URL for a given platform.
 * 
 * @param {string} url - The input URL or username
 * @param {string} platformName - The name of the platform (e.g. "Facebook")
 * @returns {Object} { isValid, formattedUrl, error }
 */
export const validateSocialMediaUrl = (url, platformName) => {
  if (!url) {
    return { isValid: false, formattedUrl: '', error: 'URL is required' };
  }

  const platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.name === platformName);

  if (!platform) {
    // If platform not found in config, treat as generic URL
    try {
      new URL(url);
      return { isValid: true, formattedUrl: url, error: null };
    } catch (e) {
      return { isValid: false, formattedUrl: url, error: 'Invalid URL format' };
    }
  }

  // 1. Format the URL (convert username to full URL)
  let formattedUrl = url;
  try {
    formattedUrl = platform.formatUrl(url);
  } catch (e) {
    return { isValid: false, formattedUrl: url, error: 'Could not format URL' };
  }

  // 2. Validate against pattern
  // Some patterns like StackOverflow are strict, others lenient
  if (platform.urlPattern) {
    if (!platform.urlPattern.test(formattedUrl)) {
      return { 
        isValid: false, 
        formattedUrl, 
        error: `Invalid ${platformName} URL format. Expected: ${platform.placeholder}` 
      };
    }
  }

  return { isValid: true, formattedUrl, error: null };
};
