
/* eslint-env node */

import fs from 'fs';
import path from 'path';
import process from 'process';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

// Verify Node.js environment
if (typeof process === 'undefined') {
  console.error('❌ Error: This script must be run in a Node.js environment.');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (...args) => path.join(__dirname, '..', ...args);

// Simple .env parser since we cannot use 'dotenv' package due to constraints
const loadEnvFile = () => {
  const envPath = resolve('.env.local');
  if (fs.existsSync(envPath)) {
    console.log('📄 Loading environment variables from .env.local');
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Remove quotes
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
};

// Try to load .env.local if variables are missing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  loadEnvFile();
}

// Configuration with fallbacks
const config = {
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  key: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
};

// Security Check
if (!config.url || !config.key) {
  console.error('\n❌ CRITICAL ERROR: Missing Supabase Credentials');
  console.error('------------------------------------------------');
  console.error('Please ensure the following environment variables are set:');
  console.error('  - SUPABASE_URL (or VITE_SUPABASE_URL)');
  console.error('  - SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)');
  console.error('\nFor Local Development:');
  console.error('  Create a .env.local file with these keys.');
  console.error('\nFor Vercel Deployment:');
  console.error('  Add these to your Project Settings > Environment Variables.');
  console.error('------------------------------------------------\n');
  process.exit(1);
}

if (config.url.includes('your-project') || config.key.includes('your-anon-key')) {
  console.error('❌ Error: Default placeholder keys detected. Please update your environment variables with real credentials.');
  process.exit(1);
}

console.log('🔐 Using Supabase URL:', config.url.substring(0, 15) + '...');

// Initialize Supabase client
const supabase = createClient(config.url, config.key, {
  auth: { persistSession: false }
});

const BASE_URL = 'https://rdm.bz';

const generateSitemap = async () => {
  console.log('🚀 Starting Sitemap Generation...');

  try {
    // Fetch all domains
    const { data: domains, error } = await supabase
      .from('domains')
      .select('name, updated_at, logo_url, category');

    if (error) throw error;

    console.log(`✅ Fetched ${domains.length} domains from Supabase.`);

    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
`;

    // 1. Static Pages
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/marketplace', priority: '0.9', changefreq: 'daily' },
      { loc: '/about', priority: '0.7', changefreq: 'monthly' },
      { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
      { loc: '/terms', priority: '0.5', changefreq: 'yearly' },
      { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
    ];

    staticPages.forEach(page => {
      xml += `  <url>
    <loc>${BASE_URL}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // 2. Dynamic Domain Pages
    domains.forEach(domain => {
      const pageUrl = `${BASE_URL}/domain/${domain.name}`;
      const lastMod = domain.updated_at ? new Date(domain.updated_at).toISOString() : currentDate;
      
      let imageXml = '';
      if (domain.logo_url) {
        const storageUrl = `${config.url}/storage/v1/object/public/domain-logos/${domain.name}/${domain.logo_url}`;
        imageXml = `
    <image:image>
      <image:loc>${storageUrl}</image:loc>
      <image:title>${domain.name} - Premium Domain Logo</image:title>
    </image:image>`;
      }

      xml += `  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>
`;
    });

    xml += `</urlset>`;

    // Write to public/sitemap.xml
    const publicPath = resolve('public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xml);
    console.log(`✅ Sitemap written to: ${publicPath}`);

    // Write to dist/sitemap.xml if it exists (for Vercel postbuild)
    const distPath = resolve('dist', 'sitemap.xml');
    if (fs.existsSync(resolve('dist'))) {
      fs.writeFileSync(distPath, xml);
      console.log(`✅ Sitemap written to: ${distPath}`);
    }

  } catch (err) {
    console.error('❌ Error generating sitemap:', err);
    process.exit(1);
  }
};

generateSitemap();
