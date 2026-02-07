
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';

const DomainLogoDisplay = ({ 
  logoUrl, 
  altText, 
  domainName, 
  className = "mb-8",
  imageClassName = "max-w-[200px] max-h-[300px]"
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // CRITICAL DEBUG: Logging for troubleshooting
    if (logoUrl) {
      console.group(`[DomainLogoDisplay] Rendering for: ${domainName}`);
      console.log('Provided Logo URL:', logoUrl);
      console.log('Alt Text:', altText);
      console.groupEnd();
    }
    
    // Reset state when props change
    setError(false);
    setLoaded(false);
  }, [logoUrl, domainName, altText]);

  // If no URL provided, don't render anything
  if (!logoUrl) return null;

  // Fallback UI if image fails to load
  if (error) {
    return (
      <div className={`flex justify-center ${className}`}>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 w-[200px] h-[200px] animate-in fade-in">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium text-center">Logo Unavailable</span>
          <span className="text-[10px] text-slate-300 mt-1 max-w-[150px] truncate">{domainName}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-center ${className}`}
    >
      <div className="relative group w-full flex justify-center">
        {/* Loading Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="w-[200px] h-[200px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
             </div>
          </div>
        )}
        
        {/* Image Container */}
        <div className={`bg-white p-4 sm:p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 inline-block relative z-10 ${!loaded ? 'invisible' : 'visible'}`}>
           <img 
            src={logoUrl} 
            alt={altText || `${domainName} logo`}
            className={`
              w-auto h-auto object-contain
              transition-opacity duration-500
              ${imageClassName}
            `}
            onLoad={() => {
              console.log(`[DomainLogoDisplay] Image loaded successfully for ${domainName}`);
              setLoaded(true);
            }}
            onError={(e) => {
              console.error(`[DomainLogoDisplay] Image load error for ${domainName}. URL: ${logoUrl}`);
              console.error(e);
              setError(true);
            }}
          />
        </div>
        
        {/* Subtle reflection effect - only show when loaded */}
        {loaded && (
          <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent opacity-50 rounded-full blur-md -z-0" />
        )}
      </div>
    </motion.div>
  );
};

export default DomainLogoDisplay;
