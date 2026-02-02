
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Extracts hardcoded footer data and migrates it to Supabase tables.
 */
export const migrateFooterData = async () => {
  const results = {
    contact: { status: 'pending', message: '' },
    socials: { status: 'pending', message: '', count: 0 },
    success: false
  };

  try {
    const { data: existingContact, error: fetchContactError } = await supabase
      .from('footer_contact')
      .select('id')
      .limit(1);

    if (fetchContactError) throw new Error(`Contact Check Error: ${fetchContactError.message}`);

    if (existingContact && existingContact.length > 0) {
      results.contact = { status: 'skipped', message: 'Contact data already exists.' };
    } else {
      const { error: insertContactError } = await supabase.from('footer_contact').insert([{
        heading_text: 'Have questions? Reach out to us!',
        email: 'info@rdm.bz',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

      if (insertContactError) throw new Error(`Contact Insert Error: ${insertContactError.message}`);
      results.contact = { status: 'migrated', message: 'Inserted default contact info.' };
    }

    const { data: existingSocials, error: fetchSocialsError } = await supabase
      .from('social_media_links')
      .select('id');

    if (fetchSocialsError) throw new Error(`Social Check Error: ${fetchSocialsError.message}`);

    if (existingSocials && existingSocials.length > 0) {
      results.socials = { status: 'skipped', message: 'Social links already exist.', count: existingSocials.length };
    } else {
      const socialLinks = [
        {
          platform: 'Twitter',
          url: 'https://twitter.com/rdm_bz',
          icon_name: 'Twitter',
          order: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/rdm_bz',
          icon_name: 'Instagram',
          order: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      const { error: insertSocialsError } = await supabase.from('social_media_links').insert(socialLinks);

      if (insertSocialsError) throw new Error(`Social Insert Error: ${insertSocialsError.message}`);
      results.socials = { status: 'migrated', message: 'Inserted default social links.', count: socialLinks.length };
    }

    results.success = true;

  } catch (err) {
    console.error('Migration failed:', err);
    results.success = false;
    results.error = err.message;
  }

  return results;
};
