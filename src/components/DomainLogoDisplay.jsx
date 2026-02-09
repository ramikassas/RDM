import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2 } from 'lucide-react';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';

const DomainLogoDisplay = ({ 
  logoUrl, 
  actualImageUrl, // Explicit URL override
  altText, 
  domainName, 
  className = "mb-8",
  imageClassName = "max-w-[200px] max-h-[300px]",
  loading = "lazy" // "lazy" | "eager"
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [finalUrl, setFinalUrl] = useState('');
  const imgRef = useRef(null);

  // Constants for timeout
  const LOAD_TIMEOUT_MS = 5000; 

  // Effect to construct the URL reliably
  useEffect(() => {
    let url = '';
    
    if (actualImageUrl) {
      url = actualImageUrl;
    } else if (logoUrl && domainName) {
      // Use the utility to ensure correct path construction
      url = getSupabaseImageUrl(domainName, logoUrl);
    } else if (logoUrl) {
      // Fallback if domainName missing but logoUrl exists (e.g. absolute URL)
      url = logoUrl;
    }

    setFinalUrl(url);
    
    // Reset state when URL changes
    if (url) {
      setLoaded(false);
      setError(false);
    }
  }, [logoUrl, actualImageUrl, domainName]);

  // Effect to handle stuck loading states (timeout)
  useEffect(() => {
    if (!finalUrl || loaded || error) return;

    const timer = setTimeout(() => {
      if (!loaded && !error) {
        console.warn(`Image load timed out for ${domainName}: ${finalUrl}`);
        setError(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [finalUrl, loaded, error, domainName]);

  // Effect to check if image is already cached/loaded immediately
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setLoaded(true);
      } else {
        // If complete but width is 0, it might be a broken image
        // We'll let onError handle it, or the timeout
      }
    }
  }, [finalUrl]);

  // SEO-optimized attributes
  const finalAltText = altText || `${domainName} - Premium Domain Logo`;
  const finalTitle = `${domainName} - Premium Domain Logo`;

  // If no URL generated, render nothing or fallback
  if (!finalUrl) {
    // Optional: render placeholder if no URL is present at all
    return null; 
  }

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
        {/* Loading Skeleton - Only show if NOT loaded and NO error */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="w-[200px] h-[200px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
             </div>
          </div>
        )}
        
        {/* Image Container */}
        <div className={`bg-white p-4 sm:p-6 rounded-3xl shadow-lg shadow-slate-100 border border-slate-100 inline-block relative z-10 ${!loaded ? 'invisible' : 'visible'}`}>
           <img 
            ref={imgRef}
            src={finalUrl} 
            alt={finalAltText}
            title={finalTitle}
            loading={loading}
            className={`
              w-auto h-auto object-contain
              transition-opacity duration-500
              ${imageClassName}
            `}
            onLoad={() => {
              // console.log(`Image loaded: ${finalUrl}`);
              setLoaded(true);
            }}
            onError={(e) => {
              console.error(`Image failed to load: ${finalUrl}`, e);
              setError(true);
              setLoaded(true); // Stop loading spinner even on error
            }}
          />
        </div>
        
        {/* Subtle reflection effect - only show when loaded */}
        {loaded && !error && (
          <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent opacity-50 rounded-full blur-md -z-0" />
        )}
      </div>
    </motion.div>
  );
};

export default DomainLogoDisplay;
