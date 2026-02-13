
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Mail } from 'lucide-react';
import SocialMediaFooterDisplay from '@/components/SocialMediaFooterDisplay';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    heading_text: 'Have questions? Reach out to us!',
    email: 'info@rdm.bz'
  });
  
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
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <footer className="bg-slate-950 text-white py-16 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">RDM</span>
              <span className="sr-only">Rare Domains Marketplace</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Rare Domains Marketplace (RDM) is the premier destination for acquiring high-value, brandable, and exclusive domain names. Secure your digital future with us.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Marketplace</h3>
            <ul className="space-y-4">
              <li><Link to="/marketplace" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Browse All Domains</Link></li>
              <li><Link to="/premium-com-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Premium .com Domains</Link></li>
              <li><Link to="/premium-domains-for-sale" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">New Arrivals</Link></li>
              <li><Link to="/find-premium-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Domain Search</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Contact Support</Link></li>
              <li><Link to="/transfer" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Transfer Guide</Link></li>
              <li><Link to="/sell-premium-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Sell Your Domain</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Connect</h3>
            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{contactInfo.heading_text}</p>
            
            <a 
              href={`mailto:${contactInfo.email}`} 
              className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-8 text-sm font-semibold group"
            >
              <div className="bg-emerald-400/10 p-2 rounded-lg mr-3 group-hover:bg-emerald-400/20 transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              {contactInfo.email}
            </a>
            
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Follow Us</h4>
              <SocialMediaFooterDisplay />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Rare Domains Marketplace (RDM). All rights reserved.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-slate-500 hover:text-white transition-colors text-xs">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-white transition-colors text-xs">Terms of Service</Link>
            <Link to="/sitemap.xml" className="text-slate-500 hover:text-white transition-colors text-xs">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
