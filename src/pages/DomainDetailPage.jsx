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
    if (domain) {
      fetchRecommended();
      const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
      return () => clearInterval(timer);
    }
  }, [domain]);

  const calculateTimeLeft = () => {
    if (!domain?.registration_date) return null;
    const expirationDate = new Date(new Date(domain.registration_date).getTime() + 365 * 24 * 60 * 60 * 1000);
    const difference = expirationDate - new Date();
    if (difference <= 0) return "EXPIRED";
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const fetchDomain = async () => {
    setLoading(true);
    try {
      const { data: domainData, error: domainError } = await supabase.from('domains').select('*').eq('name', domainName).single();
      if (domainError) throw domainError;
      const { data: seo } = await supabase.from('domain_seo_settings').select('*').eq('domain_id', domainData.id).maybeSingle();
      setDomain({ ...domainData, seo });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    setRecLoading(true);
    try {
      const { data } = await supabase.from('domains').select('*').limit(10);
      if (data) setRecommended(data.filter(d => d.name !== domainName).sort(() => 0.5 - Math.random()).slice(0, 3));
    } catch (err) { setRecError(true); }
    finally { setRecLoading(false); }
  };

  const handleBuyNow = () => {
    const params = new URLSearchParams({
      cmd: "_xclick", business: "parfankassas@gmail.com",
      item_name: `Purchase: ${domain.name}`, amount: domain.price.toString(), currency_code: "USD"
    });
    window.location.href = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  if (!domain) return <div className="min-h-screen flex flex-col items-center justify-center"><h1>Not Found</h1><Link to="/marketplace"><Button>Back</Button></Link></div>;

  const finalUrl = `https://rdm.bz/domain/${domain.name}`;
  const seoDescription = domain.description || generateAutoDescription(domain.name);
  const actualImageUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
  const finalImage = domain.seo?.og_image_url || actualImageUrl || domain.logo_url;

  return (
    <>
      <SEO 
        title={domain.seo?.page_title || `${domain.name} - Premium Domain | RDM`}
        description={seoDescription}
        image={finalImage}
        url={finalUrl}
        type="product"
      />
      
      <div className="min-h-screen bg-slate-50 pb-16">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
          <Breadcrumbs items={[{ label: 'Marketplace', path: '/marketplace' }, { label: domain.name, path: null }]} />
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col lg:flex-row items-center gap-8 mb-8 relative overflow-hidden">
               <div className="shrink-0 relative z-10">
                  <DomainLogoDisplay logoUrl={domain.logo_url} actualImageUrl={actualImageUrl} domainName={domain.name} />
               </div>
               <div className="flex-1 text-center lg:text-left relative z-10">
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                    {domain.featured && <PremiumBadge />}
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase">{domain.status}</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3">{domain.name}</h1>
                  <p className="text-lg text-slate-500">{domain.tagline}</p>
               </div>
               <div className="text-center lg:text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Price</p>
                  <div className="text-5xl font-black text-emerald-600">${domain.price?.toLocaleString()}</div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatItem label="Length" value={`${domain.name.split('.')[0].length} Chars`} icon={<BarChart3 />} />
                  <StatItem label="Extension" value={domain.tld} icon={<Globe />} />
                  <StatItem label="Status" value="Verified" icon={<ShieldCheck />} />
                  <StatItem label="Trend" value="High" icon={<TrendingUp />} />
                </div>
                <SectionCard title="Description" icon={<FileText />}>
                  <p className="text-slate-600 leading-relaxed">{seoDescription}</p>
                </SectionCard>
                {domain.use_cases && (
                  <SectionCard title="Use Cases" icon={<Target />}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {domain.use_cases.map((u, i) => <div key={i} className="p-3 bg-slate-50 rounded-lg flex items-center gap-2"><Check className="text-emerald-500 w-4 h-4"/>{u}</div>)}
                    </div>
                  </SectionCard>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 sticky top-24">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="text-emerald-600"/> Purchase</h3>
                  <div className="space-y-3">
                    <Button onClick={handleBuyNow} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 font-bold text-lg">Buy Now</Button>
                    <Button variant="outline" onClick={() => setShowOfferForm(true)} className="w-full h-12">Make Offer</Button>
                    <Button variant="secondary" onClick={() => window.open(`https://wa.me/905313715417`, '_blank')} className="w-full bg-green-50 text-green-700 border-green-200">WhatsApp Chat</Button>
                  </div>
                  {timeLeft && timeLeft !== "EXPIRED" && (
                    <div className="mt-6 p-3 bg-slate-50 rounded-xl border text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Offer expires in</p>
                      <div className="flex justify-around font-bold text-slate-800">
                        <div>{timeLeft.days}d</div><div>{timeLeft.hours}h</div><div>{timeLeft.minutes}m</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Recommendations */}
            <div className="mt-16 border-t pt-10">
              <h2 className="text-2xl font-bold mb-6">Recommended Domains</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommended.map(item => <DomainCard key={item.id} domain={item} />)}
              </div>
            </div>
          </motion.div>
          {showOfferForm && <MakeOfferForm domain={domain} onClose={() => setShowOfferForm(false)} />}
        </div>
      </div>
    </>
  );
};

export default DomainDetailPage;
