
import { supabase } from '@/lib/customSupabaseClient';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';

/**
 * Generates a full XML sitemap client-side by fetching all domains.
 * Includes explicit image sitemap tags for better SEO indexing of logos.
 */
export const generateClientSitemapXml = async () => {
  try {
    const { data: domains, error } = await supabase
      .from('domains')
      .select('name, updated_at, logo_url, category');

    if (error) throw error;

    const baseUrl = 'https://rdm.bz';
    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
`;

    // Static Pages
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
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Domain Pages
    if (domains && domains.length > 0) {
      domains.forEach(domain => {
        const url = `${baseUrl}/domain/${domain.name}`;
        const lastMod = domain.updated_at || currentDate;
        
        let imageXml = '';
        if (domain.logo_url) {
          const absoluteImageUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
          if (absoluteImageUrl) {
            imageXml = `
    <image:image>
      <image:loc>${absoluteImageUrl}</image:loc>
      <image:title>${domain.name} - Premium Domain Logo</image:title>
    </image:image>`;
          }
        }

        xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageXml}
  </url>
`;
      });
    }

    xml += `</urlset>`;
    return xml;

  } catch (err) {
    console.error('Error generating client sitemap:', err);
    throw err;
  }
};
