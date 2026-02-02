
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from '@/components/ui/use-toast';

const SocialMediaModal = ({ isOpen, onClose, linkToEdit, onSuccess }) => {
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    icon_name: '',
    order: 0
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (linkToEdit) {
      setFormData({
        platform: linkToEdit.platform || '',
        url: linkToEdit.url || '',
        icon_name: linkToEdit.icon_name || '',
        order: linkToEdit.order || 0
      });
    } else {
      setFormData({
        platform: 'Twitter',
        url: '',
        icon_name: 'Twitter',
        order: 0
      });
    }
  }, [linkToEdit, isOpen]);

  const handleSave = async () => {
    if (!formData.platform || !formData.url) {
      toast({ variant: "destructive", title: "Validation Error", description: "Platform and URL are required." });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        platform: formData.platform,
        url: formData.url,
        icon_name: formData.icon_name,
        order: parseInt(formData.order) || 0,
        updated_at: new Date().toISOString()
      };

      let error;
      if (linkToEdit) {
        const { error: updateError } = await supabase
          .from('social_media_links')
          .update(payload)
          .eq('id', linkToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('social_media_links')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: "Success", description: `Social link ${linkToEdit ? 'updated' : 'added'} successfully.` });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{linkToEdit ? 'Edit Social Link' : 'Add New Social Link'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Platform Name</label>
              <select 
                className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                value={formData.platform}
                onChange={e => setFormData({...formData, platform: e.target.value})}
              >
                <option value="Twitter">Twitter / X</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="GitHub">GitHub</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-xs font-bold text-slate-500 mb-1 block">Sort Order</label>
              <Input 
                type="number"
                value={formData.order} 
                onChange={e => setFormData({...formData, order: e.target.value})} 
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Profile URL</label>
            <Input 
              value={formData.url} 
              onChange={e => setFormData({...formData, url: e.target.value})} 
              placeholder="https://twitter.com/username"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Icon Name (Lucide React)</label>
            <Input 
              value={formData.icon_name} 
              onChange={e => setFormData({...formData, icon_name: e.target.value})} 
              placeholder="e.g. Twitter, Facebook, Instagram"
            />
            <p className="text-[10px] text-slate-400 mt-1">Exact component name from Lucide React library.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SocialMediaModal;
