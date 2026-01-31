import React, { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

/**
 * SitemapHandler
 * 
 * completely replaces the current page DOM with a pure XML sitemap.
 * This is used to serve /sitemap.xml via React Router without a server-side route.
 */
export default function SitemapHandler() {
  useEffect(() => {
    const generateSitemap = async () => {
      // 1. Static Pages Data
      const staticPages = [
        { loc: 'https://rdm.bz/', priority: '1.0', changefreq: 'weekly', lastmod: '2025-01-15' },
        { loc: 'https://rdm.bz/marketplace', priority: '0.9', changefreq: 'weekly', lastmod: '2025-01-15' },
        { loc: 'https://rdm.bz/about', priority: '0.5', changefreq: 'yearly', lastmod: '2024-12-01' },
        { loc: 'https://rdm.bz/contact', priority: '0.5', changefreq: 'yearly', lastmod: '2024-12-01' },
        { loc: 'https://rdm.bz/terms', priority: '0.2', changefreq: 'yearly', lastmod: '2024-11-01' },
        { loc: 'https://rdm.bz/privacy', priority: '0.2', changefreq: 'yearly', lastmod: '2024-11-01' },
        { loc: 'https://rdm.bz/transfer', priority: '0.5', changefreq: 'weekly', lastmod: '2025-01-10' },
      ];

      // 2. Fetch Real Domains
      let domains = [];
      try {
        const { data, error } = await supabase
          .from('domains')
          .select('name, updated_at, created_at')
          .eq('status', 'available');
          
        if (!error && data) {
          domains = data;
        }
      } catch (err) {
        console.error('Sitemap domain fetch error', err);
      }

      // 3. Construct XML String
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

      // Add Static Pages
      staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
      });

      // Add Dynamic Domains
      domains.forEach(domain => {
        const rawDate = domain.updated_at || domain.created_at || new Date().toISOString();
        const lastmod = rawDate.split('T')[0];
        const cleanName = encodeURIComponent(domain.name.trim());
        const loc = `https://rdm.bz/domain/${cleanName}`;
        
        xml += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      });

      xml += `
</urlset>`;

      // 4. Replace DOM with Pure XML
      document.documentElement.innerHTML = xml;
    };

    generateSitemap();
  }, []);

  return null;
}