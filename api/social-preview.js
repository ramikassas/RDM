export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const domainName = searchParams.get('domain');

  // بيانات افتراضية في حال فشل الاتصال
  let title = "Rare Domains Marketplace";
  let description = "Premium Domain Name for Sale";
  let image = "https://rdm.bz/og-image.png"; // تأكد من وجود صورة بهذا الاسم في public

  // إحضار مفاتيح Supabase من البيئة
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (domainName && supabaseUrl && supabaseKey) {
    try {
      // البحث عن الدومين في قاعدة البيانات
      const response = await fetch(
        `${supabaseUrl}/rest/v1/domains?name=eq.${domainName}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      
      const data = await response.json();

      if (data && data.length > 0) {
        const domain = data[0];
        
        // تجهيز العنوان والوصف
        title = `${domain.name} - Premium Domain for Sale`;
        if (domain.description) description = domain.description;
        
        // تجهيز الصورة
        if (domain.logo_url) {
            // إذا كان الرابط كاملاً نستخدمه، وإلا نركبه
            if (domain.logo_url.startsWith('http')) {
                image = domain.logo_url;
            } else {
                image = `${supabaseUrl}/storage/v1/object/public/domain-logos/${domain.name}/${domain.logo_url}`;
            }
        }
      }
    } catch (e) {
      console.error("Error fetching domain:", e);
    }
  }

  // الـ HTML الذي سيراه واتساب فقط
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:image" content="${image}">
      <meta property="og:url" content="https://rdm.bz/domain/${domainName}">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${image}">
    </head>
    <body>
      <h1>${title}</h1>
      <img src="${image}" />
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'content-type': 'text/html;charset=UTF-8' },
  });
}
