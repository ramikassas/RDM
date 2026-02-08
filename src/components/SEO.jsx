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
  ogTitle,
  twitterSite = "@rami_kassas",
  canonicalUrl,
  schema,
  breadcrumbSchema
}) => {
  const location = useLocation();
  const baseUrl = 'https://rdm.bz';
  const siteTitle = "Rare Domains Marketplace (RDM)";
  
  const finalTitle = title || siteTitle;
  const finalDescription = description || "Rare Domains Marketplace (RDM) is the premier marketplace for rare, premium, and exclusive domain names.";
  const finalImage = image || `${baseUrl}/og-image.png`;
  
  // توحيد الرابط لمنع تعارض الـ Canonical
  const currentPath = location.pathname.endsWith('/') && location.pathname !== '/' 
    ? location.pathname.slice(0, -1) 
    : location.pathname;
  const finalUrl = url || canonicalUrl || `${baseUrl}${currentPath}`;

  const schemasToRender = [];
  if (schema) schemasToRender.push(schema);
  if (breadcrumbSchema) schemasToRender.push(breadcrumbSchema);

  return (
    <Helmet>
      <html lang="en" />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph - استخدام key يمنع التكرار */}
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={ogTitle || finalTitle} key="og_title" />
      <meta property="og:description" content={finalDescription} key="og_desc" />
      <meta property="og:type" content={type} key="og_type" />
      <meta property="og:url" content={finalUrl} key="og_url" />
      <meta property="og:image" content={finalImage} key="og_img" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={finalTitle} key="tw_title" />
      <meta name="twitter:description" content={finalDescription} key="tw_desc" />
      <meta name="twitter:image" content={finalImage} key="tw_img" />
      <meta name="twitter:url" content={finalUrl} key="tw_url" />

      {schemasToRender.map((s, index) => (
        <script key={`schema-${index}`} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
