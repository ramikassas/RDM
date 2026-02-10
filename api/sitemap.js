export default async function handler(req) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const baseUrl = 'https://rdm.bz';

  // 1. الصفحات الثابتة (الأساسية)
  const staticPages = [
    '',
    '/marketplace',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/transfer',
    '/premium-domains-for-sale',
    '/sell-premium-domains',
    '/ai-domains',      // صفحات هبوط مهمة
    '/saas-domains',
    '/fintech-domains'
  ];

  let domains = [];
  let categories = [];

  if (supabaseUrl && supabaseKey) {
    try {
      // 2. جلب الدومينات من قاعدة البيانات
      const domainsResponse = await fetch(
        `${supabaseUrl}/rest/v1/domains?select=name,updated_at`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      domains = await domainsResponse.json();

      // 3. جلب التصنيفات (Categories) المميزة
      // ملاحظة: سنقوم بجلب كل التصنيفات الفريدة المستخدمة في الدومينات
      const categoriesResponse = await fetch(
        `${supabaseUrl}/rest/v1/domains?select=category`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const rawCategories = await categoriesResponse.json();
      
      // تنظيف القائمة: إزالة التكرار والفراغات
      const uniqueCategories = new Set();
      rawCategories.forEach(item => {
        if (item.category) {
            // بعض التصنيفات قد تكون مفصولة بفواصل، نفصلها
            const cats = item.category.split(',').map(c => c.trim());
            cats.forEach(c => {
                if(c.length > 0) uniqueCategories.add(c);
            });
        }
      });
      categories = Array.from(uniqueCategories);

    } catch (e) {
      console.error("Error fetching data for sitemap", e);
    }
  }

  // --- بناء الـ XML ---

  // أ) الصفحات الثابتة
  const staticXml = staticPages.map(page => `
    <url>
      <loc>${baseUrl}${page}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  // ب) صفحات الدومينات (الأهم)
  const domainXml = domains.map(domain => `
    <url>
      <loc>${baseUrl}/domain/${domain.name}</loc>
      <lastmod>${domain.updated_at || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
  `).join('');

  // ج) صفحات التصنيفات (Categories)
  // نفترض أن رابط التصنيف في موقعك هو /marketplace?category=XYZ
  // أو إذا كان لديك روابط مخصصة مثل /category/ai
  const categoryXml = categories.map(cat => {
    // تحويل الاسم لرابط (مثلاً: "AI Domains" -> "AI%20Domains")
    const slug = encodeURIComponent(cat);
    return `
    <url>
      <loc>${baseUrl}/marketplace?category=${slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticXml}
      ${categoryXml}
      ${domainXml}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate'
    },
  });
}
