import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/customSupabaseClient';
import SEOEditorForm from './SEOEditorForm';
import { Loader2 } from 'lucide-react';

const SEOEditorModal = ({ isOpen, onClose, domain }) => {
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState(null);

  useEffect(() => {
    if (isOpen && domain) {
      fetchSeoData();
    }
  }, [isOpen, domain]);

  const fetchSeoData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('domain_seo_settings')
        .select('*')
        .eq('domain_id', domain.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setSeoData(data);
      } else {
        // Generate defaults if no existing data
        const title = `${domain.name} - Premium Domain for Sale`;
        setSeoData({
            page_title: title,
            page_heading: domain.name, // Default H1
            og_title: title, // Default Social Title
            // meta_description removed - sourced from domain.description
            h1_title: domain.name,
            canonical_url: `https://rdm.bz/domain/${domain.name}`,
            og_image_url: domain.logo_url || ''
        });
      }
    } catch (err) {
      console.error("Error fetching SEO data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full lg:max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Edit SEO Settings: <span className="text-emerald-600">{domain?.name}</span></DialogTitle>
          <DialogDescription>
            Configure meta tags, social previews, and structured data. <span className="text-amber-600 font-medium">Note: Description is managed in the main Domain Inventory.</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <SEOEditorForm 
              initialData={seoData} 
              domainId={domain?.id} 
              domainDescription={domain?.description} // Pass description from domain table
              onSuccess={onClose} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SEOEditorModal;