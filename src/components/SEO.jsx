
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { generateDomainSchema } from '@/utils/schemaGenerator';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  url,
  ogUrl,
  twitterUrl,
  twitterSite,
  canonicalUrl,
  schema,
  breadcrumbSchema,
  ogTitle,
  domainData // New prop for auto-generation
}) => {
  const location = useLocation();
  const baseUrl = 'https://rdm.bz';
  
  const siteTitle = "Rare Domains Marketplace (RDM)";
  const finalTitle = title || "Rare Domains Marketplace (RDM) - Premium Digital Assets";
  // Allow overriding OG title specifically, otherwise fall back to main title
  const finalOgTitle = ogTitle || finalTitle; 
  const finalDescription = description || "Rare Domains Marketplace (RDM) is the premier marketplace for rare, premium, and exclusive domain names.";
  
  // URL Construction Logic
  const pathname = location.pathname.startsWith('/') ? location.pathname : `/${location.pathname}`;
  let cleanPath = pathname;
  if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
    cleanPath = cleanPath.slice(0, -1);
  }
  
  const constructedUrl = `${baseUrl}${cleanPath}`;
  
  // URL Priorities:
  // 1. Specific ogUrl/twitterUrl prop (Highest priority for Domain Detail Pages)
  // 2. Generic url prop
  // 3. Constructed URL from window location
  
  const finalOgUrl = ogUrl || url || constructedUrl;
  const finalTwitterUrl = twitterUrl || finalOgUrl; // Fallback to OG URL if specific twitter URL not provided
  const finalCanonicalUrl = canonicalUrl || finalOgUrl;
  
  // Image Logic - prioritize passed image, fallback to default
  const defaultImage = "https://rdm.bz/og-image.png";
  const finalImage = image || defaultImage;

  // Schema Injection Logic
  const schemasToRender = [];
  
  // 1. Add explicitly passed schema (e.g. Breadcrumbs or Custom Domain Schema)
  if (schema) {
    schemasToRender.push(schema);
  }
  
  // 2. Auto-generate Domain Product Schema if no custom schema provided AND domainData is present
  // We check if 'schema' is missing or empty to avoid duplicates
  const hasCustomSchema = schema && Object.keys(schema).length > 0;
  
  if (!hasCustomSchema && domainData) {
    const autoSchema = generateDomainSchema({
      name: domainData.name,
      description: domainData.description || finalDescription,
      image: domainData.image || finalImage,
      url: domainData.url || finalCanonicalUrl,
      price: domainData.price,
      status: domainData.status
    });
    
    if (autoSchema) {
      schemasToRender.push(autoSchema);
    }
  }

  // 3. Add Breadcrumb schema if provided
  if (breadcrumbSchema) {
    schemasToRender.push(breadcrumbSchema);
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{finalTitle}</title>
      
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical Link */}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:image" content={finalImage} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      <meta name="twitter:url" content={finalTwitterUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />

      {/* JSON-LD Schemas */}
      {schemasToRender.map((s, index) => (
        <script key={index} type="application/ld+json">
          {/* Auto-generated JSON-LD Schema from domain data (if applicable) */}
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
