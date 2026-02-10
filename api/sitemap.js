export default async function handler(req) {
  // 1. الاتصال بقاعدة البيانات لجلب الدومينات
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  let domains = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/domains?select=name,updated_at`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      domains = await response.json();
    } catch (e) {
      console.error("Error fetching domains for sitemap", e);
    }
  }

  // 2. القائمة الثابتة (الصفحات الرئيسية)
  const staticPages = [
    '',
    '/marketplace',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/transfer',
    '/premium-domains-for-sale',
    '/sell-premium-domains'
  ];

  // 3. بناء الـ XML
  const baseUrl = 'https://rdm.bz';
  
  const staticXml = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  const dynamicXml = domains.map(domain => `
    <url>
      <loc>${baseUrl}/domain/${domain.name}</loc>
      <lastmod>${domain.updated_at || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  `).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticXml}
      ${dynamicXml}
    </urlset>`;

  // 4. إرسال الرد بصيغة XML
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    },
  });
}
