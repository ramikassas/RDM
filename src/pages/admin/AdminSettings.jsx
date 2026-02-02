
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    contact_email: '',
    support_phone: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('*').single();
      if (data) setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ ...settings, updated_at: new Date() })
        .eq('id', settings.id);
        
      if (error) throw error;
      toast({ title: "Saved", description: "Settings updated successfully." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <>
      <SEO title="Global Settings | RDM Admin" />
      <div className="max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Global Settings</h1>
          <p className="text-slate-500 mt-1">Manage site configuration and contact information.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Site Name</label>
            <Input 
              value={settings.site_name} 
              onChange={(e) => setSettings({...settings, site_name: e.target.value})} 
              placeholder="My Domain Marketplace"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Contact Email</label>
            <Input 
              value={settings.contact_email} 
              onChange={(e) => setSettings({...settings, contact_email: e.target.value})} 
              placeholder="admin@example.com"
            />
            <p className="text-xs text-slate-400">This email will be displayed on the contact page.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Support Phone</label>
            <Input 
              value={settings.support_phone} 
              onChange={(e) => setSettings({...settings, support_phone: e.target.value})} 
              placeholder="+1 (555) 000-0000"
            />
          </div>
          
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 mt-2">
            Last Updated: {formatDate(settings.updated_at)}
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;
