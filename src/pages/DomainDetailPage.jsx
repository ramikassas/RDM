
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Check, 
  ShoppingCart, 
  Send, 
  TrendingUp, 
  ExternalLink, 
  Globe, 
  ShieldCheck, 
  AlertCircle, 
  Lock, 
  Flame,
  Tag,
  BarChart3,
  MessageCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import MakeOfferForm from '@/components/MakeOfferForm';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import WhoisModal from '@/components/WhoisModal';
import PremiumBadge from '@/components/PremiumBadge';
import { formatDateOnly } from '@/utils/formatDate';

const DomainDetailPage = () => {
  const { domainName } = useParams();
  const [domain, setDomain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const { toast } = useToast();

  // WHOIS State
  const [isWhoisModalOpen, setIsWhoisModalOpen] = useState(false);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(null);
  const [whoisError, setWhoisError] = useState(null);

  useEffect(() => {
    fetchDomain();
    trackPageView();
  }, [domainName]);

  // Interest Tracking
  useEffect(() => {
    let timer;
    const TRACKING_DELAY = 15000; 

    const trackInterest = async () => {
      if (!domain?.id) return;

      try {
        const storageKey = `rdm_interest_${domain.id}`;
        if (sessionStorage.getItem(storageKey)) return; 

        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;
        if (!ip) return;

        const { error } = await supabase
          .from('domain_interest_logs')
          .insert([{ domain_id: domain.id, ip_address: ip, view_duration: 15 }]);

        if (!error) {
          sessionStorage.setItem(storageKey, 'true');
          setInterestCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Tracking error:', err);
      }
    };

    if (domain && domain.id) {
       timer = setTimeout(trackInterest, TRACKING_DELAY);
    }
    return () => clearTimeout(timer);
  }, [domain]);

  useEffect(() => {
    const fetchInterestCount = async () => {
      if (!domain?.id) return;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from('domain_interest_logs')
        .select('ip_address')
        .eq('domain_id', domain.id)
        .gte('created_at', thirtyDaysAgo.toISOString());
      if (!error && data) {
        const uniqueIPs = new Set(data.map(r => r.ip_address)).size;
        setInterestCount(uniqueIPs);
      }
    };
    if (domain) fetchInterestCount();
  }, [domain]);

  // Countdown
  useEffect(() => {
    if (!domain?.registration_date) {
      setTimeLeft(null);
      return;
    }
    const calculateTimeLeft = () => {
      const regDate = new Date(domain.registration_date);
      const expirationDate = new Date(regDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const difference = expirationDate - now;
      if (difference <= 0) return "EXPIRED";
      return { 
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    if (initialTime === "EXPIRED") return;
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [domain?.registration_date]);

  const trackPageView = () => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `Domain: ${domainName}`,
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  };

  const fetchDomain = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .eq('name', domainName)
      .single();
    if (!error && data) setDomain(data);
    setLoading(false);
  };

  const handleBuyNow = () => {
    if (window.gtag) window.gtag('event', 'click_buy_now', { domain_name: domain.name, domain_price: domain.price });
    const productionUrl = "https://rdm.bz";
    const returnUrl = window.location.hostname === 'localhost' 
      ? `${window.location.origin}/transfer?domain=${encodeURIComponent(domain.name)}` 
      : `${productionUrl}/transfer?domain=${encodeURIComponent(domain.name)}`;
    const cancelUrl = window.location.href;
    const baseUrl = "https://www.paypal.com/cgi-bin/webscr";
    const params = new URLSearchParams({
      cmd: "_xclick",
      business: "parfankassas@gmail.com",
      item_name: `Premium Domain Purchase: ${domain.name}`,
      amount: domain.price.toString(),
      currency_code: "USD",
      no_shipping: "1",
      return: returnUrl,
      cancel_return: cancelUrl,
      rm: "2",
      notify_url: `${productionUrl}/api/paypal-webhook`,
    });
    toast({ title: "Redirecting to PayPal...", description: "Securely transferring you to payment gateway.", duration: 5000 });
    window.location.href = `${baseUrl}?${params.toString()}`;
  };

  const handleGoDaddyBuy = () => {
    if (window.gtag) window.gtag('event', 'click_godaddy_buy', { domain_name: domain.name });
    window.open(`https://godaddy.com/forsale/${domain.name}`, '_blank', 'noopener,noreferrer');
  };

  const handleMakeOffer = () => {
    if (window.gtag) window.gtag('event', 'click_make_offer', { domain_name: domain.name });
    setShowOfferForm(true);
  };

  const handleWhatsAppContact = () => {
    if (window.gtag) window.gtag('event', 'click_whatsapp_contact', { domain_name: domain.name });
    const message = `Is the domain ${domain.name} available?`;
    window.open(`https://wa.me/905313715417?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWeb3Redirect = () => {
    const searchTerm = domain.name.toLowerCase().endsWith('.web3') ? domain.name : `${domain.name}.web3`;
    window.open(`https://unstoppabledomains.com/search?searchTerm=${searchTerm}&searchRef=homepage`, '_blank');
  };

  const handleWhoisLookup = async () => {
    if (isWeb3Domain) {
      toast({ title: "WHOIS Not Available", description: "WHOIS data is not available for Web3 domains.", variant: "destructive" });
      return;
    }
    setWhoisLoading(true);
    setWhoisError(null);
    setIsWhoisModalOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke('whois', { body: { domain: domain.name } });
      if (error) throw new Error(error.message || 'Failed to fetch WHOIS data');
      if (data && data.error) throw new Error(data.error);
      setWhoisData(data);
    } catch (err) {
      console.error(err);
      setWhoisError(err.message);
      toast({ title: "Lookup Failed", description: err.message, variant: "destructive" });
    } finally {
      setWhoisLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div></div>;
  
  if (!domain) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Domain Not Found</h1>
        <p className="text-slate-600 mb-6">The domain you're looking for isn't listed in our marketplace.</p>
        <Link to="/marketplace"><Button>Back to Marketplace</Button></Link>
      </div>
    );
  }

  const isWeb3Domain = (domain.tld && domain.tld.toLowerCase() === '.web3') || (domain.name && domain.name.toLowerCase().endsWith('.web3'));
  const domainLen = domain.name.split('.')[0].length;
  const isShort = domainLen <= 4;
  const currentUrl = `https://rdm.bz/domain/${domain.name}`;

  // --- UPDATED SEO ---
  const seoTitle = `Buy ${domain.name} - Premium Domain Name Purchase`;
  const seoDescription = domain.description 
    ? `${domain.description.substring(0, 150)}... Buy ${domain.name} now.` 
    : `Secure ${domain.name} today. Premium ${domain.category} domain available for immediate transfer. One-time purchase price of $${domain.price}.`;

  const transactionalKeywords = [
    `buy ${domain.name}`,
    `purchase ${domain.name}`,
    "premium domain purchase",
    "one-time purchase"
  ].join(', ');

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": domain.name,
    "description": domain.description || `Premium domain name ${domain.name} for sale.`,
    "image": "https://rdm.bz/og-image.png",
    "url": currentUrl,
    "sku": domain.name,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": domain.price,
      "availability": domain.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Rare Domains Marketplace (RDM)"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem", "position": 1, "name": "Marketplace", "item": "https://rdm.bz/marketplace"
    },{
      "@type": "ListItem", "position": 2, "name": domain.name, "item": currentUrl
    }]
  };

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={transactionalKeywords}
        type="product"
        schema={productSchema}
        breadcrumbSchema={breadcrumbSchema}
        canonicalUrl={currentUrl}
      />

      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Marketplace', path: '/marketplace' }, { label: domain.name, path: null }]} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <main className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden border border-slate-100">
              <div className="p-6 sm:p-8 md:p-12">
                
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12 pb-8 border-b border-slate-100">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                      {domain.featured && <PremiumBadge variant="large" />}
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">{domain.tld}</span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1"><Tag className="w-3 h-3" /> {domain.category}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                        domain.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        domain.status === 'sold' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${domain.status === 'available' ? 'bg-emerald-500' : domain.status === 'sold' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        {domain.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight break-words">{domain.name}</h1>
                    </div>
                    
                    <p className="text-xl text-slate-500 font-medium max-w-2xl">{domain.tagline || `The perfect digital address for your next big venture in ${domain.category}.`}</p>
                  </div>
                  <div className="hidden lg:block text-right">
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Valuation</p>
                    <div className="text-5xl font-black text-emerald-600 tracking-tight">${domain.price.toLocaleString()}</div>
                    <p className="text-xs text-slate-400 mt-2 flex items-center justify-end gap-1"><Lock className="w-3 h-3" /> Secure Escrow Included</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-7 xl:col-span-8 space-y-12">
                    <section>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">Asset Overview</h2>
                      <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed">
                         <p>{domain.description || `Acquire ${domain.name}, a premium domain name now available for purchase. This asset offers brevity, memorability, and authority in the ${domain.category} space.`}</p>
                      </div>
                    </section>
                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> Asset Characteristics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                         <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Length</div><div className="text-xl font-black text-slate-800">{domainLen} Chars</div></div>
                         <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Extension</div><div className="text-xl font-black text-slate-800">{domain.tld}</div></div>
                         <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Complexity</div><div className="text-xl font-black text-slate-800">{domain.name.includes('-') ? 'Hyphenated' : 'Clean'}</div></div>
                         <div className="p-3 bg-slate-50 rounded-lg text-center"><div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Est. Value</div><div className="text-xl font-black text-emerald-600">High</div></div>
                      </div>
                    </section>
                    {domain.use_cases && domain.use_cases.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Strategic Applications</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {domain.use_cases.map((useCase, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-600 shrink-0"><Check className="w-5 h-5" /></div>
                              <div><h3 className="font-semibold text-slate-900 mb-1">Use Case {index + 1}</h3><p className="text-sm text-slate-600 leading-snug">{useCase}</p></div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    {domain.usp_points && domain.usp_points.length > 0 && (
                      <section className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
                        <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                          <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 relative z-10"><ShieldCheck className="w-6 h-6 text-emerald-400" /> Investment Highlights</h2>
                          <div className="grid gap-6 relative z-10">
                            {domain.usp_points.map((point, index) => (
                              <div key={index} className="flex gap-4"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.5)]" /><p className="text-lg text-slate-200 font-light leading-relaxed">{point}</p></div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-5 xl:col-span-4">
                    <div className="sticky top-24 space-y-6">
                      <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                        {interestCount >= 5 && (
                          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="bg-white p-2 rounded-full shadow-sm shrink-0"><Flame className="w-5 h-5 text-orange-500 fill-orange-500" /></div>
                            <div><p className="text-orange-900 font-bold text-sm">Strong Demand</p><p className="text-orange-700 text-xs mt-1 font-medium leading-tight">{interestCount} potential buyers viewed this asset recently.</p></div>
                          </div>
                        )}
                        <div className="lg:hidden mb-8 text-center border-b border-slate-100 pb-6">
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-2">Buy It Now</p>
                          <div className="text-4xl font-black text-emerald-600">${domain.price.toLocaleString()}</div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-lg font-bold text-slate-900 mb-4">Acquisition Options</h3>
                          {isWeb3Domain ? (
                            <Button size="lg" onClick={handleWeb3Redirect} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-16 text-lg shadow-lg shadow-blue-200/50 rounded-xl transition-transform active:scale-[0.98]"><Globe className="mr-2 h-5 w-5" /> View on Unstoppable</Button>
                          ) : (
                            <>
                              <Button size="lg" onClick={handleBuyNow} disabled={domain.status !== 'available'} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-16 text-lg shadow-lg shadow-emerald-200/50 rounded-xl transition-transform active:scale-[0.98] flex flex-col items-center justify-center gap-0.5"><span className="flex items-center"><ShoppingCart className="mr-2 h-5 w-5" /> Buy Now</span><span className="text-[10px] font-normal opacity-80 uppercase tracking-wide">Instant Ownership Transfer</span></Button>
                              <Button 
                                size="lg" 
                                onClick={handleGoDaddyBuy}
                                disabled={domain.status !== 'available'}
                                className="w-full mt-3 bg-[#FFD700] hover:bg-[#E6C200] text-slate-900 font-bold h-14 text-lg shadow-lg shadow-yellow-200/50 rounded-xl transition-transform active:scale-[0.98] border border-yellow-400"
                              >
                                <span className="flex items-center">
                                  Buy via GoDaddy <ExternalLink className="ml-2 h-5 w-5 opacity-80" />
                                </span>
                              </Button>
                            </>
                          )}
                          <div className="relative py-2"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Or negotiate</span></div></div>
                          <Button size="lg" variant="outline" onClick={handleMakeOffer} disabled={domain.status !== 'available'} className="w-full h-14 border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all rounded-xl"><Send className="mr-2 h-5 w-5" /> Make an Offer</Button>
                          <Button size="lg" variant="outline" onClick={handleWhatsAppContact} className="w-full h-14 border-2 border-green-200 bg-green-50 text-green-700 font-bold hover:bg-green-100 hover:border-green-300 transition-all rounded-xl"><MessageCircle className="mr-2 h-5 w-5" /> Contact via WhatsApp</Button>
                          {timeLeft && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center animate-in fade-in slide-in-from-top-2">
                               <p className="text-xs uppercase font-bold text-slate-400 mb-2 flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> Time until Expiration</p>
                               {timeLeft === "EXPIRED" ? <p className="text-red-600 font-bold text-lg">Domain Expired</p> : (
                                  <div className="flex justify-center items-end gap-2 text-slate-800">
                                     <div className="flex flex-col items-center"><span className="text-lg font-black leading-none">{timeLeft.days}</span><span className="text-[10px] text-slate-500 uppercase">Days</span></div>
                                     <span className="text-lg font-light text-slate-300 leading-none mb-2">/</span>
                                     <div className="flex flex-col items-center"><span className="text-lg font-black leading-none">{timeLeft.hours}</span><span className="text-[10px] text-slate-500 uppercase">Hours</span></div>
                                     <span className="text-lg font-light text-slate-300 leading-none mb-2">/</span>
                                     <div className="flex flex-col items-center"><span className="text-lg font-black leading-none">{timeLeft.minutes}</span><span className="text-[10px] text-slate-500 uppercase">Min</span></div>
                                     <span className="text-lg font-light text-slate-300 leading-none mb-2">/</span>
                                     <div className="flex flex-col items-center"><span className="text-lg font-black leading-none">{timeLeft.seconds}</span><span className="text-[10px] text-slate-500 uppercase">Sec</span></div>
                                  </div>
                               )}
                            </div>
                          )}
                          <div className="pt-2"><Button size="sm" variant="ghost" onClick={handleWhoisLookup} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold transition-all rounded-lg h-10"><Globe className="mr-2 h-4 w-4" /> WHOIS Lookup</Button></div>
                        </div>
                        <div className="mt-6 space-y-3">
                          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg"><ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" /><span>Secure escrow transaction protection</span></div>
                          <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" /><span>High-value premium branding asset</span></div>
                        </div>
                      </div>
                      <div className="text-center"><Link to="/contact" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">Need help? Contact Broker <ExternalLink className="ml-1.5 w-3 h-3" /></Link></div>
                    </div>
                  </div>
                </div>

                {/* Footer Internal Links */}
                <div className="mt-20 pt-10 border-t border-slate-100">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Explore More</h2>
                   <div className="flex flex-wrap gap-4">
                      {domain.tld === '.com' && (
                        <Link to="/premium-com-domains" className="group flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                          Browse more premium .COM domains <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      )}
                      <Link to="/premium-domain-pricing" className="group flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                         View premium domain pricing <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/sell-premium-domains" className="group flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                         Sell your premium domain <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/premium-domains-for-sale" className="group flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                         All premium domains for sale <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                   </div>
                </div>

                {domain.similar_domains && domain.similar_domains.length > 0 && (
                  <div className="mt-10 pt-10 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Explore Similar Premium Assets</h2>
                    <div className="flex flex-wrap gap-3">
                      {domain.similar_domains.map((similar, index) => (
                        <Link to={`/marketplace?search=${similar}`} key={index} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all">
                          {similar}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
          </motion.div>
          
          {showOfferForm && <MakeOfferForm domain={domain} onClose={() => setShowOfferForm(false)} />}
          <WhoisModal isOpen={isWhoisModalOpen} onClose={() => setIsWhoisModalOpen(false)} data={whoisData} loading={whoisLoading} error={whoisError} domain={domain.name} />
        </div>
      </div>
    </>
  );
};

export default DomainDetailPage;
