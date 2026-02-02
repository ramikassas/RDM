
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PremiumBadge from '@/components/PremiumBadge';

const DomainCard = ({ domain }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-slate-200 flex flex-col h-full overflow-hidden"
    >
      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 break-words leading-tight flex items-center">
              {domain.name}
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
          {domain.description && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {domain.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium uppercase">Price</span>
            <span className="text-xl font-bold text-emerald-600">
              ${domain.price.toLocaleString()}
            </span>
          </div>
          <Link to={`/domain/${domain.name}`}>
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
