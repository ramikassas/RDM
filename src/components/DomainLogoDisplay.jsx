
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Loader2, Globe } from 'lucide-react';
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
  const imgRef = useRef(null);

  // Constants for timeout
  const LOAD_TIMEOUT_MS = 8000; // Extended timeout

  // Synchronously derive finalUrl
  const finalUrl = useMemo(() => {
    // LOGGING - Task 1C
    // console.log(`DomainLogoDisplay [${domainName}] - input logoUrl:`, logoUrl, 'actualImageUrl:', actualImageUrl);
    
    if (actualImageUrl) return actualImageUrl;
    if (logoUrl && domainName) return getSupabaseImageUrl(domainName, logoUrl);
    if (logoUrl) return logoUrl;
    return null;
  }, [actualImageUrl, logoUrl, domainName]);

  // LOGGING - Check unavailability condition
  // useEffect(() => {
  //   console.log(`DomainLogoDisplay [${domainName}] - finalUrl:`, finalUrl, 'showUnavailable:', !finalUrl || error);
  // }, [finalUrl, error, domainName]);

  // Effect to handle state reset when URL changes
  useEffect(() => {
    if (finalUrl) {
      setLoaded(false);
      setError(false);
    } else {
      // If no URL, we consider it "loaded" as a fallback state immediately
      setLoaded(true);
      setError(false); // Not strictly an error, just empty
    }
  }, [finalUrl]);

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
      }
    }
  }, [finalUrl]);

  const finalAltText = altText || `${domainName} - Premium Domain Logo`;
  const finalTitle = `${domainName} - Premium Domain Logo`;

  // Fallback Component (Shared)
  const FallbackIcon = () => (
    <div className={`flex justify-center ${className}`}>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-emerald-100/50 w-[180px] h-[100px] animate-in fade-in duration-700">
        <Globe className="w-12 h-12 text-slate-200 mb-1" strokeWidth={1.5} />
        {/* Optional: Show domain name text instead of just icon? 
            For now, just a clean icon as requested. */}
      </div>
    </div>
  );

  // If no URL generated, render Fallback instead of nothing (Task 6/7)
  if (!finalUrl) {
    return <FallbackIcon />; 
  }

  // Fallback UI if image fails to load (Task 6/7)
  if (error) {
    return <FallbackIcon />;
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
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="w-[180px] h-[100px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
             </div>
          </div>
        )}
        
        {/* Image Container */}
        <div className={`
            bg-white p-4 rounded-xl inline-block relative z-10 
            ${!loaded ? 'invisible h-[100px]' : 'visible'} 
            transition-all duration-300
        `}>
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
              // console.log(`Image loaded successfully: ${domainName}`);
              setLoaded(true);
            }}
            onError={(e) => {
              console.error(`Image failed to load: ${finalUrl}`);
              setError(true);
              setLoaded(true);
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
