
import React, { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * SitemapHandler
 * 
 * Client-side component that handles the /sitemap.xml route.
 * It delegates generation to the 'generate-sitemap' Edge Function
 * and replaces the document content with the returned XML.
 */
export default function SitemapHandler() {
  useEffect(() => {
    const loadSitemap = async () => {
      try {
        // Invoke the Edge Function
        // We use GET if supported, otherwise default POST is fine for most cases, 
        // but semantic GET is better for fetching data.
        const { data, error } = await supabase.functions.invoke('generate-sitemap', {
          method: 'GET',
        });

        if (error) throw error;

        let xmlContent = '';

        // Handle different response types from supabase-js invoke
        if (typeof data === 'string') {
          xmlContent = data;
        } else if (data instanceof Blob) {
          xmlContent = await data.text();
        } else {
          // If JSON object returned inadvertently, try to stringify or fail gracefully
          console.warn('Sitemap received non-string data format', data);
          return;
        }

        // Validate basic XML structure before replacing
        if (xmlContent.startsWith('<?xml') || xmlContent.includes('<urlset')) {
          // Replace the entire document content with the XML
          document.open();
          document.write(xmlContent);
          document.close();
          
          // Force content-type simulation for the browser view (cosmetic only, as headers are already sent)
          // This doesn't change headers but helps with some browser extensions
          document.contentType = 'text/xml'; 
        } else {
          console.error('Invalid XML received');
        }

      } catch (err) {
        console.error('Failed to load sitemap:', err);
        // Silent failure or redirect to home could be implemented here
      }
    };

    loadSitemap();
  }, []);

  // Render nothing while loading
  return null;
}
