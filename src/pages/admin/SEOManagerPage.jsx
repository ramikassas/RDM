
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, Edit, CheckCircle, AlertTriangle, RefreshCcw, AlertCircle, Image as ImageIcon, ExternalLink, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SEOEditorModal from '@/components/admin/seo/SEOEditorModal';
import { formatDateOnly } from '@/utils/formatDate';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Link } from 'react-router-dom';

const SEOManagerPage = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDomainsWithSEO();
  }, []);

  const fetchDomainsWithSEO = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch domains
      const { data: domainsData, error: domainsError } = await supabase
        .from('domains')
        .select('id, name, logo_url, category, description')
        .order('name');
      
      if (domainsError) throw domainsError;

      // 2. Fetch SEO statuses
      const { data: seoData, error: seoError } = await supabase
        .from('domain_seo_settings')
        .select('domain_id, updated_at, og_image_url, schema_data');

      if (seoError) throw seoError;

      // 3. Map status
      const seoMap = new Map();
      seoData.forEach(item => {
        seoMap.set(item.domain_id, {
           updated_at: item.updated_at,
           og_image_url: item.og_image_url,
           schema_data: item.schema_data
        });
      });

      const processed = domainsData.map(d => {
        const seo = seoMap.get(d.id);
        
        // Determine if using custom schema or falling back to auto
        const hasCustomSchema = seo?.schema_data && Object.keys(seo.schema_data).length > 0;
        
        return {
          ...d,
          hasSeo: !!seo,
          lastUpdated: seo?.updated_at,
          ogImage: seo?.og_image_url,
          hasCustomSchema
        };
      });

      setDomains(processed);

    } catch (err) {
      console.error("Error fetching SEO manager data:", err);
      setError(err.message || "Failed to load domains data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (domain) => {
    setSelectedDomain(domain);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDomain(null);
    fetchDomainsWithSEO(); // Refresh list to update status
  };

  const filteredDomains = domains.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <Breadcrumbs items={[{ label: 'Admin', path: '/admin' }, { label: 'SEO Manager', path: null }]} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">SEO Manager</h1>
           <p className="text-slate-500 mt-1">Configure meta tags and search appearance for individual domain pages.</p>
        </div>
        <div className="flex gap-2">
           <Link to="/admin/fix-seo-images">
              <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                 <ImageIcon className="w-4 h-4 mr-2" /> Populate Images
              </Button>
           </Link>
        </div>
      </div>
      
      <div className="flex items-center relative">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
         <Input 
           placeholder="Search domains..." 
           className="pl-9 w-full md:w-[300px]" 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid gap-4">
        {loading ? (
           <div className="flex justify-center p-12">
             <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
           </div>
        ) : error ? (
           <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
             <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
             <h3 className="text-red-800 font-semibold mb-1">Failed to load data</h3>
             <p className="text-red-600 text-sm mb-4">{error}</p>
             <Button variant="outline" onClick={fetchDomainsWithSEO} className="gap-2 bg-white border-red-200 text-red-700 hover:bg-red-50">
               <RefreshCcw className="w-4 h-4" /> Retry
             </Button>
           </div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
             <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b font-medium text-sm text-slate-500 uppercase tracking-wider">
               <div className="col-span-4 md:col-span-3">Domain Name</div>
               <div className="col-span-4 md:col-span-2">SEO Status</div>
               <div className="hidden md:block col-span-2 text-xs">Schema</div>
               <div className="hidden md:block col-span-2 text-xs">OG Image</div>
               <div className="col-span-3 md:col-span-2 hidden md:block">Last Updated</div>
               <div className="col-span-4 md:col-span-1 text-right">Actions</div>
             </div>
             
             <div className="divide-y divide-slate-100">
               {filteredDomains.length > 0 ? (
                 filteredDomains.map(domain => (
                   <div key={domain.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50/50 transition-colors">
                     <div className="col-span-4 md:col-span-3 font-semibold text-slate-900 truncate">
                       {domain.name}
                     </div>
                     <div className="col-span-4 md:col-span-2">
                       {domain.hasSeo ? (
                         <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                           <CheckCircle className="w-3 h-3" /> Configured
                         </Badge>
                       ) : (
                         <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                           <AlertTriangle className="w-3 h-3" /> Missing
                         </Badge>
                       )}
                     </div>
                     <div className="hidden md:block col-span-2">
                       {domain.hasCustomSchema ? (
                         <Badge variant="secondary" className="text-[10px] bg-purple-50 text-purple-700 border-purple-100">
                           Custom
                         </Badge>
                       ) : (
                         <Badge variant="secondary" className="text-[10px] bg-blue-50 text-blue-700 border-blue-100 gap-1">
                           <Code className="w-3 h-3" /> Auto Schema
                         </Badge>
                       )}
                     </div>
                     <div className="hidden md:block col-span-2 text-xs text-slate-500 truncate" title={domain.ogImage || 'No Image Set'}>
                       {domain.ogImage ? (
                         domain.ogImage.includes('og-image.png') ? (
                           <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Placeholder</span>
                         ) : (
                           <a href={domain.ogImage} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600 hover:underline">
                              <ExternalLink className="w-3 h-3" /> {domain.ogImage.split('/').pop()}
                           </a>
                         )
                       ) : '-'}
                     </div>
                     <div className="col-span-3 md:col-span-2 hidden md:block text-sm text-slate-500">
                       {domain.lastUpdated ? formatDateOnly(domain.lastUpdated) : '-'}
                     </div>
                     <div className="col-span-4 md:col-span-1 flex justify-end">
                       <Button size="sm" variant="outline" onClick={() => handleEdit(domain)}>
                         <Edit className="w-4 h-4 mr-2" /> Edit
                       </Button>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="p-8 text-center text-slate-500">
                   {searchTerm ? 'No domains found matching your search.' : 'No domains found in the database.'}
                 </div>
               )}
             </div>
          </div>
        )}
      </div>

      <SEOEditorModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
        domain={selectedDomain} 
      />
    </div>
  );
};

export default SEOManagerPage;
