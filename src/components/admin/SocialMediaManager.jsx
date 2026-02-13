
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Share2, 
  ExternalLink,
  GripVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reorder } from "framer-motion";
import SocialMediaLinkForm from './SocialMediaLinkForm';
import SocialMediaIconRenderer from '@/components/SocialMediaIconRenderer';
import { SOCIAL_MEDIA_PLATFORMS } from '@/config/SOCIAL_MEDIA_PLATFORMS';

const SocialMediaManager = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_media_links')
        .select('*')
        .order('order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching social links:', error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link? This cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from('social_media_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Deleted", description: "Social link removed successfully." });
      // Optimistic update
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLink(null);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    setIsSaving(true);
    try {
      const payload = {
        platform: formData.platform,
        url: formData.url,
        icon_name: formData.icon_name,
        order: formData.order,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingLink) {
        const { error: updateError } = await supabase
          .from('social_media_links')
          .update(payload)
          .eq('id', editingLink.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('social_media_links')
          .insert([{ ...payload, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Social link ${editingLink ? 'updated' : 'added'} successfully.` 
      });
      setIsModalOpen(false);
      fetchLinks();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Reordering logic
  const handleReorder = async (newOrder) => {
    setLinks(newOrder); // Optimistic UI update
    
    // In a real app with many items, we might debounce this
    // For now, we update all items' order field in DB
    try {
      const updates = newOrder.map((item, index) => ({
        id: item.id,
        order: index,
        platform: item.platform, // Required for upsert usually, but specific ID update is better
        updated_at: new Date().toISOString()
      }));

      // Supabase bulk update is tricky without rpc, so we loop for simplicity or use upsert
      // Using upsert is better
      const { error } = await supabase
        .from('social_media_links')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;
      
    } catch (err) {
      console.error("Reorder failed", err);
      toast({ variant: "destructive", title: "Reorder Failed", description: "Could not save new order." });
      fetchLinks(); // Revert
    }
  };

  if (loading && links.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Share2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Social Media Links</h3>
            <p className="text-sm text-slate-500">Manage links displayed in the footer. Drag to reorder.</p>
          </div>
        </div>
        <Button onClick={handleAdd} size="sm" className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
          <Share2 className="h-8 w-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm">No social media links added yet.</p>
          <Button variant="link" onClick={handleAdd} className="text-emerald-600 mt-2">Add your first link</Button>
        </div>
      ) : (
        <Reorder.Group axis="y" values={links} onReorder={handleReorder} className="space-y-2">
          {links.map((link) => (
            <Reorder.Item key={link.id} value={link} className="touch-none">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white hover:border-emerald-200 hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-3">
                  <div className="text-slate-300 group-hover:text-slate-500">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: SOCIAL_MEDIA_PLATFORMS.find(p => p.name === link.platform)?.color || '#64748b' }}
                  >
                    <SocialMediaIconRenderer platformName={link.platform} className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      {link.platform}
                    </h4>
                    <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-slate-500 hover:text-emerald-600 hover:underline flex items-center gap-1 max-w-[200px] sm:max-w-xs truncate">
                      {link.url} <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(link)}>
                    <Edit className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(link.id)}>
                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-600" />
                  </Button>
                </div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingLink ? 'Edit Social Link' : 'Add New Social Link'}</DialogTitle>
          </DialogHeader>
          <SocialMediaLinkForm 
            initialData={editingLink} 
            onSave={handleSave} 
            onCancel={() => setIsModalOpen(false)}
            isSaving={isSaving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMediaManager;
