
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SEOHead = ({ 
  seoData, 
  defaultTitle, 
  defaultDescription, 
  defaultKeywords,
  image,
  type = 'website',
  canonicalUrl,
  schema,
  breadcrumbSchema
}) => {
  const location = useLocation();
  const baseUrl = 'https://rdm.bz'; 
  
  // Data Priority: 1. DB Data (seoData) -> 2. Props (default*) -> 3. Hardcoded Fallbacks
  const title = seoData?.meta_title || defaultTitle || "Rare Domains Marketplace (RDM) - Premium Digital Assets";
  const description = seoData?.meta_description || defaultDescription || "Rare Domains Marketplace (RDM) is the premier marketplace for rare, premium, and exclusive domain names.";
  const keywords = seoData?.meta_keywords || defaultKeywords;
  
  // Construct Canonical URL
  const pathname = location.pathname.startsWith('/') ? location.pathname : `/${location.pathname}`;
  let cleanPath = pathname;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  const derivedCanonicalUrl = canonicalUrl || `${baseUrl}${cleanPath}`;
  const finalImage = image || "https://rdm.bz/og-image.png";
  const siteName = "Rare Domains Marketplace (RDM)";

  return (
    <Helmet>
      {/* HTML Attributes */}
      <html lang="en" />
      
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      <link rel="canonical" href={derivedCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={derivedCanonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={derivedCanonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={finalImage} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
      
      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
