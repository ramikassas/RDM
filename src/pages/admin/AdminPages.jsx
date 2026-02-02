
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Globe, Loader2, Edit, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from '@/utils/formatDate';
import ContactSettingsAdmin from '@/components/admin/ContactSettingsAdmin';
import SocialMediaManager from '@/components/admin/SocialMediaManager';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null); // null means creating new
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('page_seo')
      .select('*')
      .order('page_name', { ascending: true });
      
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      page_name: page.page_name || '',
      page_slug: page.page_slug || '',
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      h1_title: page.h1_title || '',
      page_heading: page.page_heading || '',
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPage(null);
    setFormData({
      page_name: '',
      page_slug: '',
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      h1_title: '',
      page_heading: '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.page_name) {
      toast({ variant: "destructive", title: "Validation Error", description: "Page Name is required." });
      return;
    }
    if (!formData.page_slug) {
      toast({ variant: "destructive", title: "Validation Error", description: "Page Slug is required." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        page_name: formData.page_name,
        page_slug: formData.page_slug,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        h1_title: formData.h1_title,
        page_heading: formData.page_heading,
        updated_at: new Date().toISOString()
      };

      let error;

      if (editingPage) {
        // Update existing
        const { error: updateError } = await supabase
          .from('page_seo')
          .update(payload)
          .eq('id', editingPage.id);
        error = updateError;
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('page_seo')
          .insert([{
             ...payload,
             created_at: new Date().toISOString()
          }]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: "Success", description: `Page SEO ${editingPage ? 'updated' : 'created'} successfully.` });
      setIsModalOpen(false);
      fetchPages(); // Refresh list
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const filteredPages = pages.filter(p => 
    p.page_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.page_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
      </div>

      <Tabs defaultValue="seo" className="space-y-6">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="seo" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Globe className="h-4 w-4 mr-2" /> Page SEO
          </TabsTrigger>
          <TabsTrigger value="footer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Settings className="h-4 w-4 mr-2" /> Footer & Social
          </TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="text-sm text-slate-500">
               Manage meta tags, titles, and headings for site pages.
             </div>
             <Button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700">
               <Plus className="mr-2 h-4 w-4" /> Add Page
             </Button>
          </div>

          <div className="flex items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <Search className="h-5 w-5 text-slate-400 mr-3" />
            <input
              type="text"
              placeholder="Search pages..."
              className="flex-1 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Pages Grid */}
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg border border-slate-200">
              <p className="text-slate-500">No pages found matching your search.</p>
              <Button variant="link" onClick={handleCreate} className="text-emerald-600">Create one now</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages.map(page => (
                <div key={page.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-emerald-500" />
                      <div>
                        <h3 className="font-bold text-slate-900">{page.page_name}</h3>
                        <code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">/{page.page_slug}</code>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                      <Edit className="h-4 w-4 text-slate-400 hover:text-emerald-600" />
                    </Button>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Meta Title</p>
                      <p className="text-sm text-slate-700 line-clamp-2" title={page.meta_title}>
                        {page.meta_title || <span className="text-slate-300 italic">Not set</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">Description</p>
                      <p className="text-sm text-slate-600 line-clamp-3" title={page.meta_description}>
                        {page.meta_description || <span className="text-slate-300 italic">Not set</span>}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                    <span>Updated: {formatDate(page.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="footer" className="space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <ContactSettingsAdmin />
             <SocialMediaManager />
           </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Modal (SEO Pages) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPage ? `Edit SEO: ${editingPage.page_name}` : 'Add New Page SEO'}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Page Name (Internal)</label>
                <Input value={formData.page_name} onChange={e => setFormData({...formData, page_name: e.target.value})} placeholder="e.g. About Page" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs font-bold text-slate-500 mb-1 block">Slug (URL Identifier)</label>
                <Input 
                  value={formData.page_slug} 
                  onChange={e => setFormData({...formData, page_slug: e.target.value})} 
                  disabled={!!editingPage} 
                  className={editingPage ? "bg-slate-50" : ""}
                  placeholder="e.g. about"
                />
                {!editingPage && <p className="text-[10px] text-slate-400 mt-1">Unique identifier used in code (e.g. 'home', 'about')</p>}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold text-slate-900">Meta Tags</h4>
              
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Meta Title (Browser Tab)</label>
                <Input 
                  value={formData.meta_title} 
                  onChange={e => setFormData({...formData, meta_title: e.target.value})} 
                  placeholder="Page Title | Brand Name"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.meta_title?.length || 0}/60 chars recommended</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Meta Description</label>
                <textarea 
                  className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={formData.meta_description} 
                  onChange={e => setFormData({...formData, meta_description: e.target.value})} 
                  placeholder="Brief summary of the page content for search engines..."
                />
                <p className="text-[10px] text-slate-400 mt-1 text-right">{formData.meta_description?.length || 0}/160 chars recommended</p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Meta Keywords</label>
                <Input 
                  value={formData.meta_keywords} 
                  onChange={e => setFormData({...formData, meta_keywords: e.target.value})} 
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-bold text-slate-900">On-Page Content</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">H1 Title (Main Heading)</label>
                  <Input 
                    value={formData.h1_title} 
                    onChange={e => setFormData({...formData, h1_title: e.target.value})} 
                    placeholder="Main Visible Title"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Page Sub-Heading</label>
                  <Input 
                    value={formData.page_heading} 
                    onChange={e => setFormData({...formData, page_heading: e.target.value})} 
                    placeholder="Secondary text or tagline"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (editingPage ? 'Save Changes' : 'Create Page')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPages;
