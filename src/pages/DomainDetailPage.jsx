import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, ShoppingCart, Send, TrendingUp, ExternalLink, Globe, 
  ShieldCheck, AlertCircle, Lock, Flame, Tag, BarChart3, 
  MessageCircle, Clock, ArrowRight, Info, Server, FileText, 
  Target, CreditCard, RefreshCcw, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import MakeOfferForm from '@/components/MakeOfferForm';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import WhoisModal from '@/components/WhoisModal';
import PremiumBadge from '@/components/PremiumBadge';
import DomainLogoDisplay from '@/components/DomainLogoDisplay';
import DomainCard from '@/components/DomainCard';
import { formatDateOnly } from '@/utils/formatDate';
import { getSupabaseImageUrl } from '@/utils/getSupabaseImageUrl';
import { generateAutoDescription } from '@/utils/generateAutoDescription';

const SectionCard = ({ title, icon, children, className = "" }) => (
  <section className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {(title || icon) && (
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        {icon && <span className="text-emerald-600">{icon}</span>}
        {title && <h2 className="text-lg font-bold text-slate-800">{title}</h2>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </section>
);

const StatItem = ({ label, value, icon }) => (
  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors group text-center h-full">
    {icon && <div className="mb-2 text-slate-400 group-hover:text-emerald-600 transition-colors">{icon}</div>}
    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</div>
    <div className="text-lg md:text-xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">{value}</div>
  </div>
);

const DomainDetailPage = () => {
  const { domainName } = useParams();
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const { toast } = useToast();
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(false);
  const [isWhoisModalOpen, setIsWhoisModalOpen] = useState(false);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(null);
  const [whoisError, setWhoisError] = useState(null);

  useEffect(() => {
    fetchDomain();
  }, [domainName]);

  useEffect(() => {
    if (domain) fetchRecommended();
  }, [domain]);

  const fetchDomain = async () => {
    setLoading(true);
    try {
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select('*')
        .eq('name', domainName)
        .single();
      
      if (domainError) throw domainError;

      let seoData = null;
      const { data: seo, error: seoError } = await supabase
        .from('domain_seo_settings')
        .select('*')
        .eq('domain_id', domainData.id)
        .maybeSingle();
      
      if (!seoError) seoData = seo;
      setDomain({ ...domainData, seo: seoData });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Logic for UI and Actions (Same as your original logic)
  const handleBuyNow = () => { /* ... existing logic ... */ };
  const handleGoDaddyBuy = () => window.open(`https://godaddy.com/forsale/${domain?.name}`, '_blank');
  const handleWhatsAppContact = () => window.open(`https://wa.me/905313715417?text=Is%20the%20domain%20${domain?.name}%20available?`, '_blank');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  if (!domain) return <div className="min-h-screen flex flex-col items-center justify-center p-4"><h1>Domain Not Found</h1><Link to="/marketplace"><Button>Back</Button></Link></div>;

  // --- REFINED SEO LOGIC ---
  const finalUrl = `https://rdm.bz/domain/${domain.name}`;
  const seoTitle = domain.seo?.page_title || `${domain.name} - Premium Domain for Sale | RDM`;
  const seoDescription = domain.description || generateAutoDescription(domain.name);
  
  const actualImageUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
  const finalImage = domain.seo?.og_image_url || actualImageUrl || domain.logo_url;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": domain.name,
    "description": seoDescription,
    "image": finalImage,
    "offers": {
      "@type": "Offer",
      "price": domain.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  };

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        image={finalImage}
        url={finalUrl} // Unified URL
        type="product"
        ogTitle={domain.seo?.og_title || seoTitle}
        schema={productSchema}
      />
      
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
          <Breadcrumbs items={[{ label: 'Marketplace', path: '/marketplace' }, { label: domain.name, path: null }]} />
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header, Stats, and Content go here (Keep your original JSX structure) */}
            <h1 className="text-4xl font-black">{domain.name}</h1>
            {/* ... rest of your UI ... */}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default DomainDetailPage;
