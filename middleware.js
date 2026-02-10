export const config = {
  matcher: '/domain/:path*',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  // اكتشاف الروبوتات
  const isBot = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|discordbot/i.test(userAgent);

  if (isBot) {
    const domainName = url.pathname.split('/').pop();
    
    // نجهز رابط الـ API الداخلي
    const apiUrl = new URL(request.url);
    apiUrl.pathname = '/api/social-preview';
    apiUrl.searchParams.set('domain', domainName);
    
    // نقوم بجلب المحتوى من الـ API يدوياً (Proxy Mode)
    const apiResponse = await fetch(apiUrl);
    
    // نرسل نتيجة الـ API مباشرة للروبوت
    return new Response(apiResponse.body, {
      status: apiResponse.status,
      headers: apiResponse.headers
    });
  }
}
