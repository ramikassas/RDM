import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { Mail, ShieldCheck, CreditCard, Wallet, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import SocialMediaFooterDisplay from '@/components/SocialMediaFooterDisplay';

const Footer = () => {
  // Contact Info State
  const [contactInfo, setContactInfo] = useState({
    heading_text: 'Have questions? Reach out to us!',
    email: 'info@rdm.bz'
  });

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');

  // Handle Newsletter Subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    setSubscribeStatus('loading');
    setStatusMessage('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: newsletterEmail }]);

      if (error) {
        // Postgres unique violation code for duplicate email
        if (error.code === '23505') {
          setSubscribeStatus('error');
          setStatusMessage('You are already subscribed to our list.');
        } else {
          throw error;
        }
      } else {
        // Success
        setSubscribeStatus('success');
        setStatusMessage('You have successfully subscribed!');
        setNewsletterEmail(''); 
        
        // Reset status after 5 seconds
        setTimeout(() => {
          setSubscribeStatus('idle');
          setStatusMessage('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeStatus('error');
      setStatusMessage('Something went wrong. Please try again.');
    }
  };
  
  // Fetch Contact Info on Mount
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
          
          {/* Column 1: Logo, Description & Trust Badges */}
          <div className="md:col-span-1 space-y-6">
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <span className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">RDM</span>
                <span className="sr-only">Rare Domains Marketplace</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed">
                Rare Domains Marketplace (RDM) is the premier destination for acquiring high-value, brandable, and exclusive domain names. Secure your digital future with us.
              </p>
            </div>

            {/* Trust & Payment Badges Section */}
            <div className="pt-4 border-t border-slate-900/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Secured Transactions via</p>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 text-slate-300 text-xs" title="Escrow Service">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Escrow</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 text-slate-300 text-xs" title="Crypto Payments">
                        <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Crypto</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 text-slate-300 text-xs" title="Bank Transfer / Cards">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Wire/Card</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Column 2: Marketplace Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Marketplace</h3>
            <ul className="space-y-4">
              <li><Link to="/marketplace" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Browse All Domains</Link></li>
              <li><Link to="/premium-com-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Premium .com Domains</Link></li>
              <li><Link to="/premium-domains-for-sale" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">New Arrivals</Link></li>
              <li><Link to="/find-premium-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Domain Search</Link></li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white tracking-wide">Company</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Contact Support</Link></li>
              <li><Link to="/transfer" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Transfer Guide</Link></li>
              <li><Link to="/sell-premium-domains" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm font-medium">Sell Your Domain</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-8">
            
            {/* Newsletter Section */}
            <div>
                <h3 className="text-lg font-bold mb-2 text-white tracking-wide">Stay Ahead</h3>
                <p className="text-slate-400 text-xs mb-4">Get alerts for new premium domains.</p>
                
                <form onSubmit={handleSubscribe} className="relative">
                    <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                        className={`w-full bg-slate-900 border rounded-lg py-2.5 pl-4 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none transition-all
                            ${subscribeStatus === 'error' ? 'border-red-500/50 focus:ring-red-500/50' : 'border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50'}
                            ${subscribeStatus === 'success' ? 'border-emerald-500/50' : ''}
                        `}
                    />
                    <button 
                        type="submit" 
                        disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                        className="absolute right-1.5 top-1.5 p-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 rounded text-slate-950 transition-colors"
                    >
                        {subscribeStatus === 'loading' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : subscribeStatus === 'success' ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                            <ArrowRight className="w-4 h-4" />
                        )}
                    </button>
                </form>

                {/* Status Messages */}
                {statusMessage && (
                    <div className={`mt-2 text-xs flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-300
                        ${subscribeStatus === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {subscribeStatus === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {statusMessage}
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contact Us</h4>
                <a 
                href={`mailto:${contactInfo.email}?subject=Domain Inquiry`} 
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-semibold group"
                >
                <div className="bg-emerald-400/10 p-2 rounded-lg mr-3 group-hover:bg-emerald-400/20 transition-colors">
                    <Mail className="h-4 w-4" />
                </div>
                {contactInfo.email}
                </a>
            </div>
            
            {/* Social Media */}
            <div>
              <SocialMediaFooterDisplay />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="border-t border-slate-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
             <span className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Rare Domains Marketplace (RDM). All rights reserved.</span>
          </div>
          
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
