
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

// Simple in-memory cache to prevent redundant fetches during session
const seoCache = {};

export const usePageSEO = (pageSlug) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const fetchSEO = useCallback(async () => {
    if (!pageSlug) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (seoCache[pageSlug]) {
      setSeoData(seoCache[pageSlug]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('page_seo')
        .select('*')
        .eq('page_slug', pageSlug)
        .single();

      if (error) {
        // If data not found, we don't treat it as a critical error, just return null
        if (error.code === 'PGRST116') {
          console.warn(`No SEO data found for slug: ${pageSlug}`);
          setSeoData(null);
        } else {
          throw error;
        }
      } else {
        seoCache[pageSlug] = data; // Update cache
        setSeoData(data);
      }
    } catch (err) {
      console.error('Error fetching SEO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageSlug]);

  useEffect(() => {
    fetchSEO();
  }, [fetchSEO]);

  const updateSEO = async (newData) => {
    setLoading(true);
    try {
      const payload = {
        ...newData,
        updated_at: new Date().toISOString()
      };

      // Check if it exists first
      const { data: existing } = await supabase
        .from('page_seo')
        .select('id')
        .eq('page_slug', pageSlug)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('page_seo')
          .update(payload)
          .eq('page_slug', pageSlug)
          .select()
          .single();
      } else {
        // Create new if doesn't exist (useful for dynamic pages or first time setup)
        result = await supabase
          .from('page_seo')
          .insert([{ ...payload, page_slug: pageSlug, page_name: newData.page_name || pageSlug }])
          .select()
          .single();
      }

      if (result.error) throw result.error;

      // Update state and cache
      const updatedData = result.data;
      seoCache[pageSlug] = updatedData;
      setSeoData(updatedData);
      
      return updatedData;
    } catch (err) {
      console.error('Error updating SEO:', err);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { seoData, loading, error, updateSEO, refetch: fetchSEO };
};
