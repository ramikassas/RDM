
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
const SITE_URL = 'https://rdm.bz';
const SITEMAP_PATH = path.resolve('public', 'sitemap.xml');

// Try to get credentials from process.env (Standard CI/CD)
// Fallback: This script assumes environment variables are available. 
// If running locally without .env loaded into process, you must ensure VITE_SUPABASE_URL 
// and VITE_SUPABASE_ANON_KEY are set in your shell.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  WARNING: Supabase URL or Key not found in environment variables. Sitemap generation will skip dynamic domains.');
}

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

// Static Routes with Priorities
const staticRoutes = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/marketplace', priority: '0.9', changefreq: 'daily' },
  { url: '/premium-domains-for-sale', priority: '0.8', changefreq: 'weekly' },
  { url: '/marketplaces', priority: '0.8', changefreq: 'weekly' },
  { url: '/premium-domain-pricing', priority: '0.8', changefreq: 'weekly' },
  { url: '/find-premium-domains', priority: '0.8', changefreq: 'weekly' },
  { url: '/sell-premium-domains', priority: '0.8', changefreq: 'weekly' },
  { url: '/premium-com-domains', priority: '0.8', changefreq: 'weekly' },
  { url: '/about', priority: '0.5', changefreq: 'monthly' },
  { url: '/contact', priority: '0.6', changefreq: 'monthly' },
  { url: '/transfer', priority: '0.5', changefreq: 'monthly' },
  { url: '/terms', priority: '0.3', changefreq: 'yearly' },
  { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
];

const generateSitemap = async () => {
  console.log('🗺️  Generating Sitemap...');
  const currentDate = new Date().toISOString();

  let domainRoutes = [];

  if (supabase) {
    try {
      console.log('   Fetching domains from Supabase...');
      const { data: domains, error } = await supabase
        .from('domains')
        .select('name, created_at, updated_at');

      if (error) throw error;

      if (domains) {
        console.log(`   Found ${domains.length} domains.`);
        domainRoutes = domains.map(d => ({
          url: `/domain/${d.name}`,
          priority: '0.7',
          changefreq: 'weekly',
          lastmod: d.updated_at || d.created_at || currentDate
        }));
      }
    } catch (err) {
      console.error('❌ Error fetching domains:', err.message);
    }
  }

  const allRoutes = [...staticRoutes.map(r => ({ ...r, lastmod: currentDate })), ...domainRoutes];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${SITE_URL}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  try {
    fs.writeFileSync(SITEMAP_PATH, sitemapContent);
    console.log(`✅ Sitemap generated at ${SITEMAP_PATH}`);
  } catch (err) {
    console.error('❌ Error writing sitemap file:', err);
    process.exit(1);
  }
};

generateSitemap();
