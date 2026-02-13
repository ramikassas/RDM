
import React from 'react';
import { SOCIAL_MEDIA_PLATFORMS } from '@/config/SOCIAL_MEDIA_PLATFORMS';
import { FaGlobe } from 'react-icons/fa6';
import { cn } from '@/lib/utils';

const SocialMediaIconRenderer = ({ platformName, className, iconName }) => {
  // Try to find by platform name first
  let platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.name === platformName);
  
  // If not found, try to fallback to iconName matching (if we stored legacy data)
  if (!platform && iconName) {
    // This is a fuzzy fallback if needed, but primarily we rely on platformName
    platform = SOCIAL_MEDIA_PLATFORMS.find(p => p.icon.name === iconName);
  }

  const IconComponent = platform ? platform.icon : FaGlobe;
  
  // Dynamic color application if requested, otherwise inherit
  // Note: we don't apply color inline to allow Tailwind classes to override text color
  // unless specifically needed. The parent usually controls color on hover.

  return (
    <IconComponent 
      className={cn("w-5 h-5", className)} 
      aria-hidden="true"
    />
  );
};

export default SocialMediaIconRenderer;
