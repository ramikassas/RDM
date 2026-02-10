
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
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Constants
  const LOAD_TIMEOUT_MS = 8000;
  const CACHE_KEY_PREFIX = 'img_loaded_';

  // Synchronously derive finalUrl
  const finalUrl = useMemo(() => {
    if (actualImageUrl) return actualImageUrl;
    if (logoUrl && domainName) return getSupabaseImageUrl(domainName, logoUrl);
    if (logoUrl) return logoUrl;
    return null;
  }, [actualImageUrl, logoUrl, domainName]);

  // Check LocalStorage cache to skip animation if previously loaded
  useEffect(() => {
    if (finalUrl) {
      const cachedStatus = localStorage.getItem(CACHE_KEY_PREFIX + finalUrl);
      if (cachedStatus === 'true') {
        setLoaded(true);
      }
    }
  }, [finalUrl]);

  // Intersection Observer for Lazy Loading
  useEffect(() => {
    // If priority loading (eager), skip observer and show immediately
    if (loading === 'eager') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading 100px before viewport
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, [loading]);

  // Reset state when URL changes
  useEffect(() => {
    if (finalUrl) {
      // Don't reset loaded if cached, handled by first effect
      setError(false);
    } else {
      setLoaded(true); // Treat missing URL as "loaded" fallback
      setError(false); 
    }
  }, [finalUrl]);

  // Timeout Watchdog
  useEffect(() => {
    if (!finalUrl || loaded || error || !isVisible) return;

    const timer = setTimeout(() => {
      if (!loaded && !error) {
        console.warn(`Image load timed out for ${domainName}`);
        setError(true);
      }
    }, LOAD_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [finalUrl, loaded, error, domainName, isVisible]);

  const handleLoad = () => {
    setLoaded(true);
    if (finalUrl) {
      try {
        localStorage.setItem(CACHE_KEY_PREFIX + finalUrl, 'true');
      } catch (e) {
        // Ignore storage quota errors
      }
    }
  };

  const finalAltText = altText || `${domainName} - Premium Domain Logo`;
  const finalTitle = `${domainName} - Premium Domain Logo`;

  // Fallback Component
  const FallbackIcon = () => (
    <div className={`flex justify-center ${className}`}>
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-emerald-100/50 w-[180px] h-[100px] animate-in fade-in duration-700">
        <Globe className="w-12 h-12 text-slate-200 mb-1" strokeWidth={1.5} />
      </div>
    </div>
  );

  if (!finalUrl || error) {
    return <FallbackIcon />; 
  }

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-center ${className}`}
    >
      <div className="relative group w-full flex justify-center">
        {/* Loading Skeleton */}
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
             <div className="w-[180px] h-[100px] rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center animate-pulse">
                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
             </div>
          </div>
        )}
        
        {/* Image Container */}
        {isVisible && (
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
              loading={loading} // Keep standard attribute as backup
              className={`
                w-auto h-auto object-contain
                transition-opacity duration-500
                ${imageClassName}
              `}
              onLoad={handleLoad}
              onError={() => {
                 setError(true);
                 setLoaded(true);
              }}
            />
          </div>
        )}
        
        {/* Reflection effect */}
        {loaded && !error && (
          <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent opacity-50 rounded-full blur-md -z-0" />
        )}
      </div>
    </motion.div>
  );
};

export default DomainLogoDisplay;
