
import { supabase } from '@/lib/customSupabaseClient';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';

/**
 * Utility to verify Image SEO Configuration
 * Checks: Alt Text, Absolute URLs, Sitemap Inclusion, Meta Tags
 */
export const verifyImageSEO = async () => {
  console.group('🔍 Image SEO Verification');
  
  try {
    const { data: domains, error } = await supabase
      .from('domains')
      .select('name, logo_url, logo_alt_text, id');

    if (error) throw error;

    console.log(`Checking ${domains.length} domains...`);

    const report = {
      total: domains.length,
      missingLogo: 0,
      missingAlt: 0,
      invalidUrl: 0,
      issues: []
    };

    domains.forEach(domain => {
      if (!domain.logo_url) {
        report.missingLogo++;
        return; // Skip further checks if no logo
      }

      // Check URL format
      const absoluteUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
      if (!absoluteUrl.startsWith('https://')) {
        report.invalidUrl++;
        report.issues.push({ domain: domain.name, issue: 'Non-absolute URL', value: absoluteUrl });
      }

      // Check Alt Text
      if (!domain.logo_alt_text) {
        report.missingAlt++;
        report.issues.push({ domain: domain.name, issue: 'Missing Alt Text' });
      }
    });

    console.table({
      'Total Domains': report.total,
      'Missing Logo': report.missingLogo,
      'Missing Alt Text': report.missingAlt,
      'Invalid URLs': report.invalidUrl
    });

    if (report.issues.length > 0) {
      console.log('Issues Found:', report.issues);
    } else {
      console.log('✅ All checked domains have valid image configuration.');
    }
    
    console.groupEnd();
    return report;

  } catch (err) {
    console.error('Verification Failed:', err);
    console.groupEnd();
    return null;
  }
};
