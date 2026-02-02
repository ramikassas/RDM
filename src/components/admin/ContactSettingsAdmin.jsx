
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2, MessageSquare, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const ContactSettingsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contactId, setContactId] = useState(null);
  const [formData, setFormData] = useState({
    heading_text: '',
    email: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContactSettings();
  }, []);

  const fetchContactSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('footer_contact')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        throw error;
      }

      if (data) {
        setContactId(data.id);
        setFormData({
          heading_text: data.heading_text || '',
          email: data.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching contact settings:', error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        heading_text: formData.heading_text,
        email: formData.email,
        updated_at: new Date().toISOString()
      };

      let error;
      if (contactId) {
        const { error: updateError } = await supabase
          .from('footer_contact')
          .update(payload)
          .eq('id', contactId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('footer_contact')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({ title: "Success", description: "Footer contact settings updated." });
      
      // Refresh to get ID if it was an insert
      if (!contactId) fetchContactSettings();

    } catch (error) {
      console.error('Error saving contact settings:', error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <MessageSquare className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Footer Contact Info</h3>
          <p className="text-sm text-slate-500">Customize the contact section in the website footer.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Connect Heading</label>
          <Input 
            value={formData.heading_text} 
            onChange={e => setFormData({...formData, heading_text: e.target.value})} 
            placeholder="e.g. Have questions? Reach out to us!"
          />
          <p className="text-xs text-slate-400 mt-1">The text displayed above the email address in the footer.</p>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-1 block">Public Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              className="pl-9"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="e.g. info@rdm.bz"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">The email address visitors can click to contact you.</p>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Contact Settings
        </Button>
      </div>
    </div>
  );
};

export default ContactSettingsAdmin;
