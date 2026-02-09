import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { supabase } from '@/lib/customSupabaseClient'; // لم نعد بحاجة لهذا هنا
import PremiumBadge from '@/components/PremiumBadge';
import DomainLogoDisplay from '@/components/DomainLogoDisplay';
import { generateAutoDescription } from '@/utils/generateAutoDescription';

const DomainCard = ({ domain, priority = false }) => {
  const seoAltText = domain.logo_alt_text || `${domain.name} - Premium Domain Logo`;
  const loadingStrategy = priority ? "eager" : "lazy";

  const displayDescription = domain.description && domain.description.trim().length > 0
    ? domain.description
    : generateAutoDescription(domain.name);

  // ✅ الوظيفة الجديدة: بناء الرابط يدوياً لضمان الثبات والسرعة
  const resolveLogoUrl = (url) => {
    if (!url) return null;
    
    // 1. إذا كان الرابط جاهزاً (خارجي)، نستخدمه فوراً
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) {
      return url;
    }

    // 2. تنظيف الرابط من أي شرطة مائلة في البداية لتجنب الأخطاء
    const cleanPath = url.startsWith('/') ? url.slice(1) : url;

    // 3. البناء اليدوي للرابط باستخدام معرف مشروعك ومجلد domain-logos
    // هذا الرابط مباشر ولا يعتمد على تحميل أي مكتبة
    return `https://ahttbqbzhggfdqupfnus.supabase.co/storage/v1/object/public/domain-logos/${cleanPath}`;
  };

  const finalLogoUrl = resolveLogoUrl(domain.logo_url);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 flex flex-col h-full overflow-hidden group"
    >
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        
        {/* عرض اللوغو باستخدام الرابط الثابت */}
        {finalLogoUrl && (
          <div className="mb-4 -mt-2">
            <DomainLogoDisplay 
              logoUrl={finalLogoUrl}
              altText={seoAltText}
              domainName={domain.name}
              className="mb-2" 
              imageClassName="max-h-24 max-w-[180px] p-0"
              loading={loadingStrategy}
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 break-words leading-tight flex items-center">
              <Link 
                to={`/domain/${domain.name}`}
                className="hover:text-emerald-700 transition-colors"
                title={`View details for ${domain.name}`}
              >
                {domain.name}
              </Link>
            </h3>
            {domain.tagline && (
              <p className="text-sm text-slate-500 line-clamp-1">{domain.tagline}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0 flex-col-reverse sm:flex-row items-end sm:items-center">
            {domain.featured && (
              <PremiumBadge variant="small" />
            )}
          </div>
        </div>

        <div className="mb-5 flex-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-2.5 uppercase tracking-wider font-medium">
            <Tag className="h-3.5 w-3.5" />
            <span>{domain.category}</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {displayDescription}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase">Price</span>
            <span className="text-xl font-bold text-emerald-600">
              ${domain.price.toLocaleString()}
            </span>
          </div>
          <Link 
            to={`/domain/${domain.name}`}
            title={`Buy ${domain.name} - ${domain.category} Domain`}
            aria-label={`View details and buy ${domain.name}`}
          >
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-100">
              Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DomainCard;
