
import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useAutoPopulateSEO = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const populateAll = async () => {
    setLoading(true);
    setError(null);
    let count = 0;

    try {
      // 1. Fetch all domains
      const { data: domains, error: fetchError } = await supabase
        .from('domains')
        .select('*');

      if (fetchError) throw fetchError;
      if (!domains || domains.length === 0) return { success: true, count: 0 };

      // 2. Fetch existing SEO settings to avoid duplicates/overwrites if needed
      // Actually, we'll use upsert with onConflict or check individually. 
      // For this task, we want to populate missing ones mostly, but let's assume we want to ensure all have entries.
      
      const { data: existingSeo } = await supabase
        .from('domain_seo_settings')
        .select('domain_id');

      const existingIds = new Set(existingSeo?.map(item => item.domain_id) || []);
      
      const domainsToPopulate = domains.filter(d => !existingIds.has(d.id));

      if (domainsToPopulate.length === 0) {
        return { success: true, count: 0, message: "All domains already have SEO settings." };
      }

      const seoEntries = domainsToPopulate.map(domain => {
        const title = `${domain.name} - Premium ${domain.category || ''} Domain for Sale | RDM`;
        const desc = domain.description 
          ? `${domain.description.substring(0, 150)}... Buy ${domain.name} today securely at Rare Domains Marketplace.` 
          : `Buy ${domain.name}, a premium ${domain.category || ''} domain name. Secure transaction, fast transfer, and excellent investment potential.`;
        
        return {
          domain_id: domain.id,
          page_title: title,
          meta_description: desc,
          meta_keywords: `${domain.name}, buy domain, premium domain, ${domain.category || 'digital asset'}, domain for sale`,
          h1_title: domain.name,
          page_heading: `Premium Domain: ${domain.name}`,
          og_title: title,
          og_description: desc,
          og_image_url: domain.logo_url || 'https://rdm.bz/og-image.png',
          canonical_url: `https://rdm.bz/domain/${domain.name}`,
          schema_data: {}, // Default empty or basic product schema could go here
        };
      });

      // 3. Insert in batches if necessary, but 100-200 is fine in one go usually.
      const { error: insertError } = await supabase
        .from('domain_seo_settings')
        .insert(seoEntries);

      if (insertError) throw insertError;

      count = seoEntries.length;
      return { success: true, count };

    } catch (err) {
      console.error("Auto-populate SEO error:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { populateAll, loading, error };
};
