
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Share2, Code, LayoutTemplate } from 'lucide-react';

const SEOPreviewSection = ({ data, domainDescription }) => {
  const { 
    page_title, 
    canonical_url,
    page_heading,
    h1_title,
    og_title,
    og_image_url,
    og_url,
    schema_data
  } = data;

  const displayTitle = page_title || "Page Title Placeholder";
  // Use domainDescription prop directly as the primary source
  const displayDesc = domainDescription || "No description available. Please add a description in the domain details.";
  
  const displayUrl = canonical_url || "https://rdm.bz/example-page";
  
  // Prefer page_heading for H1, fallback to h1_title or placeholder
  const displayH1 = page_heading || h1_title || "Domain Name (H1)";
  
  const displayOgTitle = og_title || page_title || "Social Share Title";
  // Use domainDescription for OG as well
  const displayOgDesc = domainDescription || "No description available for social preview.";
  
  const displayOgUrl = og_url || canonical_url || "https://rdm.bz/example-page";
  
  const displayOgImage = og_image_url || "https://via.placeholder.com/1200x630?text=No+Image+Selected";

  const getHostname = (urlStr) => {
    try {
      if (!urlStr) return 'rdm.bz';
      if (!urlStr.startsWith('http')) return 'rdm.bz';
      return new URL(urlStr).hostname;
    } catch (e) {
      return 'rdm.bz';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            Google Search Result Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded border border-slate-100 max-w-[600px] font-sans">
            <div className="flex items-center gap-2 mb-1">
               <div className="bg-slate-100 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-600">
                 R
               </div>
               <div className="flex flex-col leading-tight">
                  <span className="text-sm text-slate-800 font-medium">Rare Domains Marketplace</span>
                  <span className="text-xs text-slate-500">{displayUrl}</span>
               </div>
            </div>
            <h3 className="text-xl text-[#1a0dab] hover:underline cursor-pointer font-normal truncate mb-1">
              {displayTitle}
            </h3>
            <p className="text-sm text-[#4d5156] leading-snug">
              {displayDesc.length > 160 ? displayDesc.substring(0, 160) + '...' : displayDesc}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-emerald-600" />
            On-Page Heading Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Visible Page Header (H1)</p>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {displayH1}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {displayDesc.length > 100 ? displayDesc.substring(0, 100) + '...' : displayDesc}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4 text-purple-600" />
            Social Media Preview (OG)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-[500px] border border-slate-200 rounded-lg overflow-hidden bg-slate-50 shadow-sm">
             <div className="aspect-[1.91/1] bg-slate-200 relative overflow-hidden group">
                <img 
                  src={displayOgImage} 
                  alt="Social Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                     e.target.style.display = 'none';
                     e.target.nextSibling.style.display = 'flex';
                  }} 
                />
                <div className="hidden absolute inset-0 items-center justify-center bg-slate-200 text-slate-500 text-sm font-medium">
                   Image Failed to Load
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 text-white text-[10px] p-2 rounded max-w-[90%] break-all">
                   &lt;meta property="og:image" content="{displayOgImage}" /&gt;
                </div>
             </div>
             <div className="p-3 bg-slate-100 border-t border-slate-200">
                <div className="text-xs text-slate-500 uppercase font-medium mb-1 truncate">
                   {getHostname(displayOgUrl)}
                </div>
                <div className="font-bold text-slate-900 leading-tight mb-1 truncate">
                   {displayOgTitle}
                </div>
                <div className="text-sm text-slate-600 line-clamp-2">
                   {displayOgDesc}
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <Card>
         <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
               <Code className="w-4 h-4 text-slate-500" />
               Schema Markup (JSON-LD)
            </CardTitle>
         </CardHeader>
         <CardContent>
            <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
               <pre className="text-xs font-mono text-emerald-400">
                  {schema_data || '// No schema data configured yet'}
               </pre>
            </div>
         </CardContent>
      </Card>
    </div>
  );
};

export default SEOPreviewSection;
