
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, AlertCircle, Globe, LayoutTemplate, Share2, Type, Info } from 'lucide-react';
import SEOPreviewSection from './SEOPreviewSection';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';

const SEOEditorForm = ({ initialData, domainId, domainDescription, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    page_title: initialData?.page_title || '',
    // meta_description REMOVED - uses domainDescription
    meta_keywords: initialData?.meta_keywords || '',
    h1_title: initialData?.h1_title || '',
    page_heading: initialData?.page_heading || '',
    og_title: initialData?.og_title || '',
    og_description: initialData?.og_description || '', // kept as optional override if needed in DB, but UI will focus on domain description
    og_image_url: initialData?.og_image_url || '',
    og_url: initialData?.og_url || '',
    canonical_url: initialData?.canonical_url || '',
    schema_data: initialData?.schema_data ? JSON.stringify(initialData.schema_data, null, 2) : '{}'
  });

  // Log initial data load for debugging
  useEffect(() => {
    if (initialData) {
      console.log('[SEOEditor] Initial Data Loaded:', initialData);
    }
  }, [initialData]);

  // Fetch domain info (name, logo) to auto-populate image URL
  useEffect(() => {
    const fetchDomainInfo = async () => {
      if (!domainId) return;
      
      const { data, error } = await supabase
        .from('domains')
        .select('name, logo_url')
        .eq('id', domainId)
        .single();
        
      if (!error && data) {
        // If image URL is empty, try to prepopulate it with the correct Supabase URL
        if (!formData.og_image_url && data.logo_url) {
          const actualUrl = getSupabaseImageUrl(data.name, data.logo_url);
          setFormData(prev => ({ ...prev, og_image_url: actualUrl }));
        }
      }
    };
    fetchDomainInfo();
  }, [domainId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [SEOEditor] Starting save operation for domain: ${domainId}`);

    try {
      // Validate Image URL
      if (formData.og_image_url && !formData.og_image_url.includes('ahttbqbzhggfdqupfnus.supabase.co')) {
         if (formData.og_image_url.includes('og-image.png')) {
             throw new Error("Invalid image URL. Please use a real Supabase Storage URL.");
         }
      }

      // Validate JSON
      let parsedSchema = {};
      try {
        parsedSchema = JSON.parse(formData.schema_data);
      } catch (err) {
        throw new Error("Invalid JSON in Schema Data field: " + err.message);
      }

      // Explicitly construct payload - EXCLUDING meta_description
      const payload = {
        domain_id: domainId,
        page_title: formData.page_title,
        // meta_description: formData.meta_description, // REMOVED
        meta_keywords: formData.meta_keywords,
        h1_title: formData.h1_title,
        page_heading: formData.page_heading,
        og_title: formData.og_title,
        // og_description: formData.og_description, // Can be kept if we want specific social override, but per task "Update SEOEditorForm... remove Meta Description input"
        og_image_url: formData.og_image_url,
        og_url: formData.og_url,
        canonical_url: formData.canonical_url,
        schema_data: parsedSchema,
        updated_at: new Date().toISOString()
      };

      console.log(`[${timestamp}] [SEOEditor] Payload to Supabase:`, payload);

      const { data: resultData, error } = await supabase
        .from('domain_seo_settings')
        .upsert(payload, { onConflict: 'domain_id' })
        .select();

      if (error) {
        console.error(`[${timestamp}] [SEOEditor] Supabase Error:`, error);
        throw error;
      }

      console.log(`[${timestamp}] [SEOEditor] Save Successful. Response Data:`, resultData);

      toast({
        title: "SEO Settings Saved",
        description: "The domain SEO configuration has been updated successfully."
      });
      
      if (onSuccess) onSuccess();

    } catch (error) {
      console.error(`[${timestamp}] [SEOEditor] Save Failed Exception:`, error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "An unexpected error occurred while saving SEO settings."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Form Section */}
      <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-100px)] pr-2">
        <form id="seo-form" onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Title Management */}
          <div className="space-y-6 border p-4 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-900 border-b pb-2 flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              Title & Identity Management
            </h3>
            
            {/* 1. Page Title (Meta) */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="page_title" className="flex items-center gap-2 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  Page Title (Meta Title) <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs font-mono ${formData.page_title.length > 60 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                  {formData.page_title.length}/60
                </span>
              </div>
              <Input 
                id="page_title" 
                name="page_title" 
                value={formData.page_title} 
                onChange={handleChange} 
                placeholder="e.g. Premium Domain for Sale | BrandName"
                maxLength={100}
                required
                className="font-medium"
              />
              <p className="text-xs text-slate-500 leading-snug">
                Appears in the browser tab and is the main clickable headline in Google search results. Keep it catchy and under 60 characters.
              </p>
            </div>

            {/* 2. H1 Title (On-Page) */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="page_heading" className="flex items-center gap-2 text-slate-700">
                  <LayoutTemplate className="w-3.5 h-3.5 text-emerald-500" />
                  H1 Title (Page Heading)
                </Label>
                <span className="text-xs text-slate-400">No strict limit</span>
              </div>
              <Input 
                id="page_heading" 
                name="page_heading" 
                value={formData.page_heading} 
                onChange={handleChange} 
                placeholder="e.g. BrandName.com is for Sale!"
                className="text-lg font-bold text-slate-800"
              />
              <p className="text-xs text-slate-500 leading-snug">
                The main visible heading (&lt;h1&gt;) on the domain detail page. Visitors see this immediately.
              </p>
            </div>

            {/* 3. OG Title (Social) */}
            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="og_title" className="flex items-center gap-2 text-slate-700">
                  <Share2 className="w-3.5 h-3.5 text-purple-500" />
                  OG Title (Social Media)
                </Label>
                <span className={`text-xs font-mono ${formData.og_title.length > 60 ? 'text-amber-500 font-bold' : 'text-slate-500'}`}>
                  {formData.og_title.length}/60
                </span>
              </div>
              <Input 
                id="og_title" 
                name="og_title" 
                value={formData.og_title} 
                onChange={handleChange} 
                placeholder="Defaults to Page Title if empty"
              />
              <p className="text-xs text-slate-500 leading-snug">
                Used specifically when this link is shared on Facebook, Twitter, WhatsApp, etc. Can be different from the Page Title.
              </p>
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Content & Meta</h3>
            
            {/* Meta Description Removed - Read Only View */}
            <div className="space-y-2 opacity-75">
              <div className="flex justify-between">
                <Label className="flex items-center gap-2">
                  Meta Description 
                  <span className="text-xs font-normal text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Managed in Main Inventory
                  </span>
                </Label>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded text-sm text-slate-600 italic">
                {domainDescription || "No description set in main inventory."}
              </div>
              <p className="text-xs text-slate-500">
                To edit this description, go back to the Domains list and edit the domain details directly.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_keywords">Meta Keywords</Label>
              <Textarea 
                id="meta_keywords" 
                name="meta_keywords" 
                value={formData.meta_keywords} 
                onChange={handleChange} 
                placeholder="comma, separated, keywords"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Social Sharing (Media & URL)</h3>

            <div className="space-y-2">
              <Label htmlFor="og_url">OG URL</Label>
              <Input 
                id="og_url" 
                name="og_url" 
                value={formData.og_url} 
                onChange={handleChange} 
                placeholder="Override default URL (optional)"
              />
              <p className="text-xs text-slate-500">
                Leave empty to use the default page URL.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image_url">OG Image URL (Actual Supabase URL)</Label>
              <Input 
                id="og_image_url" 
                name="og_image_url" 
                value={formData.og_image_url} 
                onChange={handleChange} 
                placeholder="https://ahttbqbzhggfdqupfnus.supabase.co/..."
              />
              <p className="text-xs text-slate-500">
                Must be a valid Supabase Storage URL (domain-logos bucket).
              </p>
              {formData.og_image_url && !formData.og_image_url.includes('ahttbqbzhggfdqupfnus') && (
                 <p className="text-xs text-amber-600 font-medium flex items-center gap-1 mt-1">
                   <AlertCircle className="w-3 h-3" /> Warning: Not a standard Supabase URL.
                 </p>
              )}
            </div>
            
            {/* Hidden fields kept in state for compatibility but not primary UI */}
            <div className="hidden">
               <Input name="h1_title" value={formData.h1_title} onChange={handleChange} />
               <Input name="canonical_url" value={formData.canonical_url} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-4 border p-4 rounded-lg bg-slate-50">
            <h3 className="font-semibold text-slate-900 border-b pb-2">Advanced</h3>
            <div className="space-y-2">
              <Label htmlFor="schema_data">JSON-LD Schema (JSON)</Label>
              <Textarea 
                id="schema_data" 
                name="schema_data" 
                value={formData.schema_data} 
                onChange={handleChange} 
                className="font-mono text-xs"
                rows={6}
              />
            </div>
          </div>

        </form>
      </div>

      {/* Preview Section */}
      <div className="space-y-6 overflow-y-auto max-h-[calc(80vh-100px)]">
         <div className="sticky top-0 bg-white z-10 pb-4 border-b mb-4">
            <h3 className="font-bold text-lg">Live Previews</h3>
            <p className="text-slate-500 text-sm">See how your page will look in search results and social shares.</p>
         </div>
         <SEOPreviewSection data={formData} domainDescription={domainDescription} />
      </div>

      <div className="lg:col-span-2 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white z-20 p-4 -mx-4 -mb-4 lg:mx-0 lg:mb-0">
         <Button type="submit" form="seo-form" disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
         </Button>
      </div>
    </div>
  );
};

export default SEOEditorForm;
