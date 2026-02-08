
import { supabase } from '@/lib/customSupabaseClient';

/**
 * One-time migration function to populate SEO data for all existing domains.
 * Skips domains that already have SEO settings.
 */
export const populateDomainSEO = async () => {
  try {
    // 1. Fetch all domains
    const { data: domains, error: domainError } = await supabase
      .from('domains')
      .select('*');

    if (domainError) throw new Error(`Error fetching domains: ${domainError.message}`);
    if (!domains || domains.length === 0) return { success: true, count: 0, message: "No domains found in database." };

    // 2. Fetch existing SEO entries to avoid duplicates
    const { data: existingSeo, error: seoError } = await supabase
      .from('domain_seo_settings')
      .select('domain_id');

    if (seoError) throw new Error(`Error fetching existing SEO: ${seoError.message}`);

    const existingDomainIds = new Set(existingSeo?.map(item => item.domain_id) || []);
    
    // Filter domains that need SEO data
    const domainsToPopulate = domains.filter(d => !existingDomainIds.has(d.id));

    if (domainsToPopulate.length === 0) {
      return { success: true, count: 0, message: "All domains already have SEO data configured." };
    }

    // 3. Generate SEO Data for missing domains
    const seoInserts = domainsToPopulate.map(domain => {
      const domainName = domain.name;
      const currentUrl = `https://rdm.bz/domain/${domainName}`;
      
      return {
        domain_id: domain.id,
        page_title: `${domainName} - Premium Domain for Sale`,
        meta_description: `Premium ${domainName} domain available for purchase. Secure your digital presence with this valuable asset.`,
        meta_keywords: `${domainName}, domain for sale, premium domain, buy domain`,
        h1_title: "Redefining Digital Asset Acquisition",
        page_heading: `Premium domain ${domainName} available for purchase. Secure your digital presence with this valuable asset.`,
        og_title: `${domainName} - Premium Domain for Sale`,
        og_description: `Premium ${domainName} domain available for purchase. Secure your digital presence with this valuable asset.`,
        og_image_url: "https://rdm.bz/og-image.png",
        canonical_url: currentUrl,
        schema_data: {
          "@context": "https://schema.org",
          "@type": "Product",
          "name": domainName,
          "description": `Premium ${domainName} domain available for purchase.`,
          "image": "https://rdm.bz/og-image.png",
          "url": currentUrl,
          "offers": {
            "@type": "Offer",
            "priceCurrency": "USD",
            "price": domain.price || "0"
          }
        }
      };
    });

    // 4. Insert Data
    // We insert in batches of 50 just to be safe with payload sizes, though Supabase handles large inserts well usually.
    const batchSize = 50;
    for (let i = 0; i < seoInserts.length; i += batchSize) {
      const batch = seoInserts.slice(i, i + batchSize);
      const { error: insertError } = await supabase
        .from('domain_seo_settings')
        .insert(batch);

      if (insertError) throw new Error(`Error inserting SEO data batch: ${insertError.message}`);
    }

    // 5. Verify (Checking count of what we just inserted)
    // In a real verification step we might re-query, but for this function, successful execution implies insertion.
    
    // 6. Return success status
    return { 
      success: true, 
      count: seoInserts.length, 
      message: `Successfully generated and saved SEO data for ${seoInserts.length} domains.` 
    };

  } catch (error) {
    console.error("SEO Population Error:", error);
    return { success: false, error: error.message };
  }
};
