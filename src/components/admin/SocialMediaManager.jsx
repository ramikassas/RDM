
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Loader2, 
  Share2, 
  ExternalLink,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Youtube,
  Mail,
  Link as LinkIcon,
  Globe,
  Phone,
  MessageCircle,
  Twitch,
  Dribbble,
  Slack
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import SocialMediaModal from './SocialMediaModal';

const iconMap = {
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Youtube,
  Mail,
  Link: LinkIcon,
  Globe,
  Phone,
  MessageCircle,
  Twitch,
  Dribbble,
  Slack
};

const SocialMediaManager = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
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
    if (!window.confirm("Are you sure you want to delete this link?")) return;

    try {
      const { error } = await supabase
        .from('social_media_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: "Deleted", description: "Social link removed." });
      fetchLinks();
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

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || iconMap.Link;
    return <IconComponent className="h-5 w-5" />;
  };

  if (loading) {
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
            <p className="text-sm text-slate-500">Manage links displayed in the footer.</p>
          </div>
        </div>
        <Button onClick={handleAdd} size="sm" className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No social media links added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  {renderIcon(link.icon_name)}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    {link.platform}
                    <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 rounded">#{link.order}</span>
                  </h4>
                  <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                    {link.url} <ExternalLink className="h-3 w-3" />
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
          ))}
        </div>
      )}

      <SocialMediaModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        linkToEdit={editingLink} 
        onSuccess={fetchLinks}
      />
    </div>
  );
};

export default SocialMediaManager;
