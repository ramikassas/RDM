
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  url,
  canonicalUrl,
  schema,
  breadcrumbSchema
}) => {
  const location = useLocation();
  const baseUrl = 'https://rdm.bz';
  
  const siteTitle = "Rare Domains Marketplace (RDM)";
  const finalTitle = title || "Rare Domains Marketplace (RDM) - Premium Digital Assets";
  const finalDescription = description || "Rare Domains Marketplace (RDM) is the premier marketplace for rare, premium, and exclusive domain names.";
  
  // URL Construction Logic
  // 1. If 'url' prop is provided explicitly, use it (for og:url).
  // 2. If not, construct from current location.
  // 3. For canonical, use 'canonicalUrl' prop if provided, otherwise default to constructed URL.
  
  const pathname = location.pathname.startsWith('/') ? location.pathname : `/${location.pathname}`;
  let cleanPath = pathname;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  const constructedUrl = `${baseUrl}${cleanPath}`;
  
  // The official URL for this page (used for og:url)
  // CRITICAL: Prioritize passed 'url' prop to ensure correct full URL is used
  const finalUrl = url || constructedUrl;
  
  // The canonical URL (often same as finalUrl, but can be overridden separately if needed)
  const finalCanonicalUrl = canonicalUrl || finalUrl;
  
  // Image Logic - prioritize passed image, fallback to default
  const defaultImage = "https://rdm.bz/og-image.png";
  const finalImage = image || defaultImage;

  // Schema Injection
  const schemasToRender = [];
  if (schema) schemasToRender.push(schema);
  if (breadcrumbSchema) schemasToRender.push(breadcrumbSchema);

  return (
    <Helmet>
      <html lang="en" />
      <title>{finalTitle}</title>
      
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* CRITICAL: Canonical Link must use the full, correct URL */}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      {/* CRITICAL: og:url must match canonical and use full URL */}
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={finalImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schemas */}
      {schemasToRender.map((s, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
