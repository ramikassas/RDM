
import { supabase } from '@/lib/customSupabaseClient';
import { getSupabaseImageUrl } from './getSupabaseImageUrl';

/**
 * Utility to populate SEO image URLs for all domains.
 * Fetches domains with logos and updates domain_seo_settings with the correct Supabase URL.
 * 
 * @returns {Promise<{success: boolean, updated: number, errors: Array, logs: Array}>}
 */
export const populateSEOImages = async () => {
  const logs = [];
  let updatedCount = 0;
  const errors = [];

  try {
    logs.push("Starting SEO Image Population...");
    
    // 1. Fetch all domains that have a logo_url
    const { data: domains, error: domainError } = await supabase
      .from('domains')
      .select('id, name, logo_url')
      .neq('logo_url', null)
      .neq('logo_url', '');

    if (domainError) throw domainError;

    logs.push(`Found ${domains.length} domains with logos.`);

    // 2. Process each domain
    for (const domain of domains) {
      try {
        const actualUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
        
        if (!actualUrl) {
          logs.push(`Skipping ${domain.name}: Could not generate URL.`);
          continue;
        }

        // Check if SEO record exists
        const { data: existingSeo } = await supabase
          .from('domain_seo_settings')
          .select('id, og_image_url')
          .eq('domain_id', domain.id)
          .maybeSingle();

        // Only update if URL is different or missing
        if (!existingSeo || existingSeo.og_image_url !== actualUrl) {
          const payload = {
            domain_id: domain.id,
            og_image_url: actualUrl,
            updated_at: new Date().toISOString()
          };
          
          // If creating new record, add required fields defaults
          if (!existingSeo) {
            payload.created_at = new Date().toISOString();
            payload.page_title = `${domain.name} - Premium Domain for Sale`;
            payload.meta_description = `Buy ${domain.name} today. Premium domain available for acquisition.`;
          }

          const { error: upsertError } = await supabase
            .from('domain_seo_settings')
            .upsert(payload, { onConflict: 'domain_id' });

          if (upsertError) throw upsertError;

          updatedCount++;
          logs.push(`Updated ${domain.name} -> ${actualUrl}`);
        } else {
          logs.push(`Skipped ${domain.name}: URL already correct.`);
        }

      } catch (err) {
        console.error(`Error processing ${domain.name}:`, err);
        errors.push({ domain: domain.name, error: err.message });
        logs.push(`ERROR ${domain.name}: ${err.message}`);
      }
    }

    logs.push(`Completed. Updated ${updatedCount} records.`);
    
    return {
      success: true,
      updated: updatedCount,
      errors,
      logs
    };

  } catch (error) {
    console.error("Fatal error in populateSEOImages:", error);
    return {
      success: false,
      updated: updatedCount,
      errors: [...errors, { domain: 'GLOBAL', error: error.message }],
      logs
    };
  }
};
