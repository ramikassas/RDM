
import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { generateDomainSchema, getOrganizationSchema, generateBreadcrumbSchema } from '@/utils/schemaGenerator';
import { generateCanonicalUrl } from '@/utils/generateCanonicalUrl';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  type = 'website',
  url,
  ogUrl,
  twitterUrl,
  twitterSite = '@rami_kassas',
  canonicalUrl,
  schema,
  breadcrumbSchema,
  ogTitle,
  domainData // Data for auto-generating Product schema
}) => {
  const location = useLocation();
  const siteTitle = "Rare Domains Marketplace (RDM)";
  
  // Defaults
  const finalTitle = title || "Rare Domains Marketplace (RDM) - Buy Premium Domains";
  const finalOgTitle = ogTitle || finalTitle; 
  const finalDescription = description || "Rare Domains Marketplace (RDM) is the premier platform to buy and sell rare, premium, and exclusive domain names.";
  const defaultImage = "https://rdm.bz/og-image.png";
  const finalImage = image || defaultImage;

  // Strict Canonical Generation
  const generatedCanonical = generateCanonicalUrl(location.pathname);
  const finalCanonicalUrl = canonicalUrl || generatedCanonical;

  // Open Graph / Twitter URL (should match canonical usually)
  const finalOgUrl = ogUrl || url || finalCanonicalUrl;
  const finalTwitterUrl = twitterUrl || finalOgUrl; 

  // --- Schema Injection Logic ---
  const schemasToRender = [];
  
  // 1. Always include Organization Schema (Global)
  schemasToRender.push(getOrganizationSchema());

  // 2. Add explicit schemas passed via props
  if (schema) {
    if (Array.isArray(schema)) {
       schemasToRender.push(...schema);
    } else {
       schemasToRender.push(schema);
    }
  }
  
  // 3. Auto-generate Domain Product Schema (ONLY if domainData provided)
  if (domainData) {
    const autoSchema = generateDomainSchema({
      name: domainData.name,
      description: domainData.description || finalDescription,
      image: finalImage,
      url: finalCanonicalUrl,
      price: domainData.price,
      status: domainData.status,
      category: domainData.category,
      sku: domainData.name
    });
    
    // Check if a Product schema was already manually passed to avoid duplicates
    const hasExistingProductSchema = schemasToRender.some(s => s['@type'] === 'Product');
    
    if (autoSchema && !hasExistingProductSchema) {
      schemasToRender.push(autoSchema);
    }
  }

  // 4. Auto-generate Breadcrumb Schema (if not passed explicitly but domainData exists)
  if (!breadcrumbSchema && domainData) {
     const autoBreadcrumb = generateBreadcrumbSchema(domainData.name);
     schemasToRender.push(autoBreadcrumb);
  } else if (breadcrumbSchema) {
    schemasToRender.push(breadcrumbSchema);
  }

  return (
    <Helmet>
      <html lang="en" />
      <title>{finalTitle}</title>
      
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Strict Canonical Link */}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalOgUrl} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={finalTitle} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterSite} />
      <meta name="twitter:url" content={finalTwitterUrl} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalTitle} />

      {/* JSON-LD Schemas */}
      {schemasToRender.map((s, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
