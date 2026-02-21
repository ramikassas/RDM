
import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

export const useBulkImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);

  const startImport = async (validData, duplicateAction, duplicateNames) => {
    setIsImporting(true);
    setProgress(0);
    const newResults = [];
    const total = validData.length;

    for (let i = 0; i < total; i++) {
      const row = validData[i];
      const isDuplicate = duplicateNames.includes(row.name);
      
      try {
        if (isDuplicate && duplicateAction === 'skip') {
          newResults.push({ name: row.name, status: 'skipped', error: 'Duplicate skipped' });
        } else {
          // Prepare payload
          const payload = {
            name: row.name,
            price: parseFloat(row.price) || 0,
            status: row.status || 'available',
            category: row.category || '',
            description: row.description || '',
            tagline: row.tagline || '',
            tld: row.name.includes('.') ? `.${row.name.split('.').pop()}` : '.com',
            featured: row.featured === 'true' || row.featured === true,
            market_rationale: row.market_rationale || '',
            technical_specifications: row.technical_specifications || '',
            registry: row.registry || '',
            transfer_type: row.transfer_type || '',
            renewal_price: row.renewal_price || '',
            logo_url: row.logo_url || null,
            use_cases: row.use_cases ? String(row.use_cases).split(',').map(s=>s.trim()) : [],
            usp_points: row.usp_points ? String(row.usp_points).split(',').map(s=>s.trim()) : []
          };

          let domainId;

          if (isDuplicate && duplicateAction === 'overwrite') {
            const { data: existing, error: fetchErr } = await supabase
              .from('domains')
              .select('id')
              .eq('name', row.name)
              .single();

            if (fetchErr) throw fetchErr;

            const { error: upErr } = await supabase
              .from('domains')
              .update(payload)
              .eq('id', existing.id);

            if (upErr) throw upErr;
            domainId = existing.id;
            newResults.push({ name: row.name, status: 'success', error: 'Overwritten' });
          } else {
            const { data: newDomain, error: insErr } = await supabase
              .from('domains')
              .insert([payload])
              .select('id')
              .single();

            if (insErr) throw insErr;
            domainId = newDomain.id;
            newResults.push({ name: row.name, status: 'success', error: null });
          }

          // Create SEO settings safely if domainId exists
          if (domainId) {
            await supabase.from('domain_seo_settings').upsert({
              domain_id: domainId,
              page_title: `Buy ${row.name} - Premium Domain`,
              meta_description: row.description || `Purchase the premium domain name ${row.name}.`
            }, { onConflict: 'domain_id' });
          }
        }
      } catch (err) {
        newResults.push({ name: row.name, status: 'error', error: err.message });
      }

      setProgress(Math.round(((i + 1) / total) * 100));
      setResults([...newResults]); // Update state iteratively for UI
    }

    setIsImporting(false);
    return newResults;
  };

  return { isImporting, progress, results, startImport };
};
