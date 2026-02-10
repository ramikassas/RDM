export default async function handler(req) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const baseUrl = 'https://rdm.bz';

  // 1. القائمة الثابتة (تأكدنا من الفواصل هنا)
  const staticPages = [
    '',
    '/marketplace',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/transfer',
    '/premium-domains-for-sale',
    '/marketplaces',
    '/premium-domain-pricing',
    '/find-premium-domains',
    '/sell-premium-domains',
    '/ai-domains',
    '/saas-domains',
    '/fintech-domains',
    '/premium-com-domains'
  ];

  let domains = [];

  // 2. جلب الدومينات من قاعدة البيانات
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
      
      if (response.ok) {
        domains = await response.json();
      } else {
        console.error("Supabase error:", response.statusText);
      }
    } catch (e) {
      console.error("Error fetching domains for sitemap", e);
    }
  }

  // --- بناء ملف الـ XML ---

  // أ) تحويل الصفحات الثابتة
  const staticXml = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  // ب) تحويل الدومينات
  // نتأكد أن domains مصفوفة لتجنب الأخطاء
  const safeDomains = Array.isArray(domains) ? domains : [];
  const domainXml = safeDomains.map(domain => `
    <url>
      <loc>${baseUrl}/domain/${domain.name}</loc>
      <lastmod>${domain.updated_at || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  `).join('');

  // ج) تجميع الخريطة
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticXml}
      ${domainXml}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    },
  });
}
