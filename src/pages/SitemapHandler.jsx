
import React, { useEffect, useState } from 'react';
import { generateClientSitemapXml } from '@/utils/generateClientSitemap';

/**
 * SitemapHandler
 * 
 * Handles client-side requests to /sitemap.xml.
 * Renders a loading state or the XML content directly in the browser window.
 * This is useful for development verification and as a fallback.
 */
export default function SitemapHandler() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        setLoading(true);
        // Generate XML directly on the client using the utility
        const xmlContent = await generateClientSitemapXml();

        if (xmlContent && xmlContent.startsWith('<?xml')) {
          // In a browser context, we can replace the document content to show raw XML
          // This simulates a server serving the file
          document.open();
          document.write(xmlContent);
          document.close();
          
          // Set content type hint (visual only in some browsers)
          // Note: Real SEO requires the file to be served with Content-Type: text/xml header,
          // which is handled by the static file generated in the postbuild script.
          document.contentType = 'text/xml'; 
        } else {
          throw new Error('Invalid XML generated');
        }

      } catch (err) {
        console.error('Failed to load sitemap:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSitemap();
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h1 className="text-2xl font-bold mb-4">Sitemap Generation Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Generating Sitemap...</h2>
        <p className="text-gray-500 mt-2">Fetching latest domain data from Supabase</p>
      </div>
    </div>
  );
}
