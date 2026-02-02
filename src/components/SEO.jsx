import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image,
  type = 'website', 
  schema, 
  breadcrumbSchema,
  canonicalUrl 
}) => {
  const location = useLocation();
  const baseUrl = 'https://rdm.bz'; 
  
  // Ensure no double slashes if pathname starts with /
  const pathname = location.pathname.startsWith('/') ? location.pathname : `/${location.pathname}`;
  
  // Clean URL handling (remove trailing slash unless it's root)
  let cleanPath = pathname;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  const derivedCanonicalUrl = canonicalUrl || `${baseUrl}${cleanPath}`;
  
  const siteName = "Rare Domains Marketplace (RDM)";
  const defaultTitle = "Rare Domains Marketplace (RDM) - Premium Digital Assets";
  const defaultDescription = "Rare Domains Marketplace (RDM) is the premier marketplace for rare, premium, and exclusive domain names. Secure your digital legacy with verified, high-value assets today.";
  const defaultImage = "https://rdm.bz/og-image.png"; 

  // Smart Title Logic
  let fullTitle = defaultTitle;
  if (title) {
    if (title.includes("RDM") || title.includes("Rare Domains Marketplace")) { 
      fullTitle = title;
    } else {
      fullTitle = `${title} | ${siteName}`;
    }
  }

  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;

  return (
    <Helmet>
      {/* HTML Attributes */}
      <html lang="en" />
      
      {/* Title */}
      <title>{fullTitle}</title>

      {/* Meta Description - Explicitly rendered for SEO */}
      <meta name="description" content={finalDescription} />

      {/* Keywords */}
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Canonical URL */}
      <link rel="canonical" href={derivedCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:url" content={derivedCanonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@rdm_bz" />
      <meta name="twitter:creator" content="@rdm_bz" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

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

export default SEO;