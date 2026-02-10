import { NextResponse } from 'next/server';

export const config = {
  matcher: '/domain/:path*', // يشتغل فقط على روابط الدومينات
};

export default function middleware(req) {
  const userAgent = req.headers.get('user-agent') || '';
  
  // قائمة الروبوتات التي نريد تحويلها (واتساب، فيسبوك، تويتر، الخ)
  const isBot = /facebookexternalhit|whatsapp|twitterbot|linkedinbot|telegrambot|discordbot/i.test(userAgent);

  if (isBot) {
    const url = req.nextUrl.clone();
    // نأخذ اسم الدومين من الرابط
    const domainName = url.pathname.split('/').pop();
    
    // نوجهه إلى صفحة خاصة لتجهيز الصورة والعنوان
    url.pathname = `/api/social-preview`;
    url.searchParams.set('domain', domainName);
    
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
