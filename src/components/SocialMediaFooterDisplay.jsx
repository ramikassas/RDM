
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import SocialMediaIconRenderer from './SocialMediaIconRenderer';
import { SOCIAL_MEDIA_PLATFORMS } from '@/config/SOCIAL_MEDIA_PLATFORMS';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SocialMediaFooterDisplay = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('social_media_links')
          .select('*')
          .order('order', { ascending: true });

        if (!error && data) {
          setLinks(data);
        }
      } catch (err) {
        console.error("Failed to load social links", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  if (loading) {
    return <div className="h-8 w-24 bg-slate-800/50 rounded animate-pulse" />;
  }

  if (links.length === 0) {
    return null; // Don't render anything if no links
  }

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {links.map((link) => {
        const platformConfig = SOCIAL_MEDIA_PLATFORMS.find(p => p.name === link.platform);
        const color = platformConfig?.color || '#94a3b8'; // default slate-400

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 hover:bg-white transition-all duration-300"
            aria-label={`Follow us on ${link.platform}`}
          >
            {/* Tooltip */}
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {link.platform}
            </span>

            <div 
              className="text-slate-400 group-hover:text-[var(--hover-color)] transition-colors"
              style={{ '--hover-color': color }}
            >
              <SocialMediaIconRenderer 
                platformName={link.platform} 
                className="w-5 h-5"
              />
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default SocialMediaFooterDisplay;
