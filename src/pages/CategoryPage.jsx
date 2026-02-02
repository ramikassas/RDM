
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SEOHead from '@/components/SEOHead';
import DomainCard from '@/components/DomainCard';
import { usePageSEO } from '@/hooks/usePageSEO';

const CategoryPage = ({ 
  slug, // The unique slug for looking up SEO data (e.g., 'premium-domains-for-sale')
  defaultTitle, 
  defaultDescription, 
  keywordsCluster, 
  fetchDomains 
}) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch SEO data based on the unique slug provided for this category route
  const { seoData } = usePageSEO(slug);

  const loadDomains = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await fetchDomains();
      
      if (apiError) throw apiError;
      
      setDomains(data || []);
    } catch (err) {
      console.error("Error fetching domains:", err);
      setError(err.message || "Failed to load domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [slug]); // Reload when category slug changes

  const pageTitle = seoData?.h1_title || defaultTitle;
  const pageHeading = seoData?.page_heading || defaultDescription;

  return (
    <>
      <SEOHead 
        seoData={seoData}
        defaultTitle={defaultTitle}
        defaultDescription={defaultDescription}
        defaultKeywords={keywordsCluster?.join(', ')}
      />

      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {pageHeading}
            </p>
          </motion.div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
                ))}
             </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Could not load domains</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <Button onClick={loadDomains} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-2">No domains found</h3>
              <p className="text-slate-500">We couldn't find any domains matching this category right now.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {domains.map((domain) => (
                <DomainCard key={domain.id} domain={domain} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
