
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Tag, Globe, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumBadge from '@/components/PremiumBadge';
import DomainLogoDisplay from '@/components/DomainLogoDisplay';
import { generateAutoDescription } from '@/utils/generateAutoDescription';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';
import { isUnstoppableDomain, getUnstoppableDomainsUrl } from '@/utils/unstoppableDomainsHelper';
import { isDomainSold } from '@/utils/isDomainSold';

const DomainCard = ({ domain, priority = false }) => {
  // Construct the descriptive alt text for SEO
  const seoAltText = domain.logo_alt_text || `${domain.name} - Premium Domain Logo`;
  const loadingStrategy = priority ? "eager" : "lazy";
  
  const isUnstoppable = isUnstoppableDomain(domain.name);
  const isSold = isDomainSold(domain);

  // Determine description to display
  const displayDescription = domain.description && domain.description.trim().length > 0
    ? domain.description
    : generateAutoDescription(domain.name);

  // Generate image URL synchronously
  const fullLogoUrl = useMemo(() => {
    if (!domain.logo_url) return null;
    const url = getSupabaseImageUrl(domain.name, domain.logo_url);
    return url;
  }, [domain.name, domain.logo_url]);

  return (
    <motion.div
      whileHover={isSold ? {} : { y: -4 }}
      className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden group ${isSold ? 'opacity-80' : 'hover:shadow-md transition-all'}`}
    >
      <div className="p-5 md:p-6 flex-1 flex flex-col relative">
        {/* Sold Overlay/Badge */}
        {isSold && (
          <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
            <Lock className="w-3 h-3" /> SOLD
          </div>
        )}

        {/* Logo Display Section */}
        <div className={`mb-4 -mt-2 ${isSold ? 'grayscale opacity-75' : ''}`}>
          <DomainLogoDisplay 
            actualImageUrl={fullLogoUrl}
            logoUrl={domain.logo_url} // Fallback/Reference
            altText={seoAltText}
            domainName={domain.name}
            className="mb-2" 
            imageClassName="max-h-24 max-w-[180px] p-0"
            loading={loadingStrategy}
          />
        </div>

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
            {domain.featured && !isSold && (
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
          
          {isSold ? (
             <Button size="sm" className="btn-disabled" disabled title="This domain has been sold">
                Sold <Lock className="ml-1.5 h-3.5 w-3.5" />
             </Button>
          ) : isUnstoppable ? (
            <a 
              href={getUnstoppableDomainsUrl(domain.name)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Buy ${domain.name} on Unstoppable Domains`}
            >
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100">
                Buy via UD <Globe className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </a>
          ) : (
            <Link 
              to={`/domain/${domain.name}`}
              title={`Buy ${domain.name} - ${domain.category} Domain`}
              aria-label={`View details and buy ${domain.name}`}
            >
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-100">
                Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DomainCard;
