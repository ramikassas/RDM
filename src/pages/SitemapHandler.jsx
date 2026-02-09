
import React, { useEffect } from 'react';
import { generateClientSitemapXml } from '@/utils/generateClientSitemap';

/**
 * SitemapHandler
 * 
 * Handles the /sitemap.xml route.
 * Uses client-side generation to ensure image tags are correctly included
 * and data is fresh from the database.
 */
export default function SitemapHandler() {
  useEffect(() => {
    const loadSitemap = async () => {
      try {
        // Generate XML directly on the client
        const xmlContent = await generateClientSitemapXml();

        if (xmlContent && xmlContent.startsWith('<?xml')) {
          // Replace document content
          document.open();
          document.write(xmlContent);
          document.close();
          
          // Set content type hint (visual only)
          document.contentType = 'text/xml'; 
        } else {
          console.error('Invalid XML generated');
        }

      } catch (err) {
        console.error('Failed to load sitemap:', err);
      }
    };

    loadSitemap();
  }, []);

  return null;
}
