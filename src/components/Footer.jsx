
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  Mail, 
  Twitter, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Github, 
  Youtube, 
  Link as LinkIcon, 
  Globe, 
  Phone, 
  MessageCircle,
  Twitch,
  Dribbble,
  Slack
} from 'lucide-react';

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

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    heading_text: 'Have questions? Reach out to us!',
    email: 'info@rdm.bz'
  });
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const { data: contactData } = await supabase
          .from('footer_contact')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (isMounted && contactData) {
          setContactInfo({
            heading_text: contactData.heading_text || 'Have questions? Reach out to us!',
            email: contactData.email || 'info@rdm.bz'
          });
        }

        const { data: linksData } = await supabase
          .from('social_media_links')
          .select('*')
          .order('order', { ascending: true });

        if (isMounted && linksData) {
          setSocialLinks(linksData);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    
    return () => { isMounted = false; };
  }, []);

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || iconMap.Link;
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-black text-white">RDM</span>
              <span className="sr-only">Rare Domains Marketplace</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Rare Domains Marketplace (RDM) is the premier destination for acquiring high-value, brandable, and exclusive domain names. Secure your digital future with us.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/marketplace" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Marketplace</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Contact</Link></li>
              <li><Link to="/transfer" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Domain Transfer Guide</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <p className="text-slate-400 text-sm mb-4">{contactInfo.heading_text}</p>
            <a href={`mailto:${contactInfo.email}`} className="inline-flex items-center text-slate-400 hover:text-emerald-400 transition-colors mb-4 text-sm">
              <Mail className="h-4 w-4 mr-2" /> {contactInfo.email}
            </a>
            
            <div className="flex space-x-4 mt-4">
              {socialLinks.length > 0 ? (
                socialLinks.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                    title={link.platform}
                  >
                    {renderIcon(link.icon_name)}
                    <span className="sr-only">{link.platform}</span>
                  </a>
                ))
              ) : !loading && (
                <>
                  <a href="https://twitter.com/rdm_bz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    <Twitter className="h-6 w-6" />
                    <span className="sr-only">Twitter</span>
                  </a>
                  <a href="https://instagram.com/rdm_bz" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    <Instagram className="h-6 w-6" />
                    <span className="sr-only">Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center">
          <span className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Rare Domains Marketplace (RDM). All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
