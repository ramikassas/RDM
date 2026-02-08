
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
  ArrowRight,
  Info,
  Server,
  FileText,
  Target,
  CreditCard,
  RefreshCcw,
  Sparkles
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
    <div className="p-6">
      {children}
    </div>
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

  // Recommended Domains State
  const [recommended, setRecommended] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(false);

  // WHOIS State
  const [isWhoisModalOpen, setIsWhoisModalOpen] = useState(false);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [whoisData, setWhoisData] = useState(null);
  const [whoisError, setWhoisError] = useState(null);

  useEffect(() => {
    fetchDomain();
    trackPageView();
  }, [domainName]);

  // Fetch Recommended Domains when domain is loaded
  useEffect(() => {
    if (domain) {
      fetchRecommended();
    }
  }, [domain]);

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
    return () => clearInterval(timer);
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
    
    try {
      // 1. Fetch Domain
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select('*')
        .eq('name', domainName)
        .single();
      
      if (domainError) {
        console.error('Error fetching domain:', domainError);
        setLoading(false);
        return;
      }

      // 2. Fetch SEO Settings (Separately to avoid complex joins in frontend-only env)
      let seoData = null;
      if (domainData) {
        const { data: seo, error: seoError } = await supabase
          .from('domain_seo_settings')
          .select('*')
          .eq('domain_id', domainData.id)
          .maybeSingle();
        
        if (!seoError) {
          seoData = seo;
        }
      }

      if (domainData) {
        setDomain({ ...domainData, seo: seoData });
      }
    } catch (err) {
      console.error('Unexpected error in fetchDomain:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    setRecLoading(true);
    setRecError(false);
    try {
      // Fetch a batch to randomly select from
      const { data, error } = await supabase.from('domains').select('*').limit(20);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Shuffle and take 3, excluding current domain
        const shuffled = data.sort(() => 0.5 - Math.random());
        const filtered = shuffled.filter(d => d.name !== domainName).slice(0, 3);
        setRecommended(filtered);
      }
    } catch (err) {
      console.error('Error fetching recommended domains:', err);
      setRecError(true);
    } finally {
      setRecLoading(false);
    }
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

  // --- SEO OPTIMIZATION LOGIC ---
  const currentUrl = `https://rdm.bz/domain/${domain.name}`;
  
  // Use new Date Format
  const listedDateDisplay = domain.listed_date ? formatDateOnly(domain.listed_date) : formatDateOnly(domain.created_at);
  const registrationDateDisplay = domain.registration_date ? formatDateOnly(domain.registration_date) : 'N/A';

  // 1. Dynamic Meta Tags
  const seoTitle = domain.seo?.page_title || `${domain.name} - Premium Domain for Sale | RDM`;
  
  // 2. Separate Social Title (OG)
  const seoOgTitle = domain.seo?.og_title || seoTitle;

  // 3. Optimized Meta Description - CONDITIONAL LOGIC (Updated Task 2 & 3)
  // Logic: If domain.description is present, use it exclusively.
  // If not, use generated auto description.
  const seoDescription = domain.description && domain.description.trim().length > 0
    ? domain.description
    : generateAutoDescription(domain.name);

  // 4. Keywords
  const seoKeywords = domain.seo?.meta_keywords || [
    `buy ${domain.name}`,
    `purchase ${domain.name}`,
    `${domain.name} price`,
    `${domain.name} for sale`,
    "premium domain purchase",
    "digital asset investment",
    `${domain.category} domains`
  ].join(', ');

  // 5. Generate Actual Supabase Image URL
  const actualSupabaseUrl = getSupabaseImageUrl(domain.name, domain.logo_url);
  
  // 6. Custom Image Priority
  let finalImage = null;

  if (domain.seo?.og_image_url && domain.seo.og_image_url.trim() !== '') {
    finalImage = domain.seo.og_image_url;
  } else if (actualSupabaseUrl) {
    finalImage = actualSupabaseUrl;
  } else if (domain.logo_url) {
    finalImage = domain.logo_url;
  }

  const finalCanonical = domain.seo?.canonical_url || currentUrl;
  const finalOgUrl = domain.seo?.og_url || currentUrl;

  // 7. Structured Data (JSON-LD)
  const productSchema = domain.seo?.schema_data && Object.keys(domain.seo.schema_data).length > 0 
    ? domain.seo.schema_data 
    : {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": domain.name,
      "description": seoDescription, // Uses the same conditional description
      "image": finalImage,
      "url": currentUrl,
      "sku": domain.name,
      "category": domain.category,
      "priceCurrency": "USD",
      "price": domain.price,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": domain.price,
        "itemCondition": "https://schema.org/NewCondition",
        "availability": domain.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Rare Domains Marketplace (RDM)",
          "url": "https://rdm.bz"
        }
      }
    };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem", 
      "position": 1, 
      "name": "Marketplace", 
      "item": "https://rdm.bz/marketplace"
    },{
      "@type": "ListItem", 
      "position": 2, 
      "name": domain.name, 
      "item": currentUrl
    }]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rare Domains Marketplace",
    "url": "https://rdm.bz",
    "logo": "https://rdm.bz/logo.png",
    "sameAs": [
       "https://twitter.com/rdm_bz",
       "https://instagram.com/rdm_bz"
    ]
  };

  const descriptiveAltText = `${domain.name} logo - premium domain for sale`;
  
  // PRIORITY: page_heading (new) -> h1_title (legacy) -> domain.name (fallback)
  const displayH1 = domain.seo?.page_heading || domain.seo?.h1_title || domain.name;

  return (
    <>
      <SEO 
        title={seoTitle}
        description={seoDescription} // Updated description source
        keywords={seoKeywords}
        type="product"
        image={finalImage}
        url={finalOgUrl}
        canonicalUrl={finalCanonical}
        schema={productSchema}
        breadcrumbSchema={breadcrumbSchema}
        ogTitle={seoOgTitle}
      />
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <div className="min-h-screen bg-slate-50 font-sans pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
          
          <Breadcrumbs items={[{ label: 'Marketplace', path: '/marketplace' }, { label: domain.name, path: null }]} />

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            
            {/* 1. Header Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col lg:flex-row items-center lg:items-start gap-8 mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 z-0"></div>
               
               {/* Logo */}
               <div className="shrink-0 relative z-10 w-full lg:w-auto flex justify-center lg:block">
                  {domain.logo_url ? (
                    <DomainLogoDisplay 
                      logoUrl={domain.logo_url} 
                      actualImageUrl={actualSupabaseUrl}
                      altText={descriptiveAltText} 
                      domainName={domain.name} 
                      className="mb-0"
                      imageClassName="max-h-[160px] max-w-[280px]"
                    />
                  ) : (
                    <div className="w-[200px] h-[160px] bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-300 font-bold text-xl">
                      {domain.name.charAt(0).toUpperCase()}
                    </div>
                  )}
               </div>

               {/* Info */}
               <div className="flex-1 text-center lg:text-left relative z-10 w-full">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                     {domain.featured && <PremiumBadge variant="default" />}
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                        domain.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        domain.status === 'sold' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${domain.status === 'available' ? 'bg-emerald-500' : domain.status === 'sold' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                        {domain.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3" /> {domain.category}
                      </span>
                  </div>

                  {/* SEO Optimized H1 - Uses page_heading */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight break-all mb-3 leading-tight">
                    {displayH1}
                    <span className="sr-only"> - Premium Domain for Sale</span>
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    {domain.tagline || `The perfect digital address for your next big venture in ${domain.category}.`}
                  </p>
               </div>

               {/* Price Desktop (Hidden Mobile) */}
               <div className="hidden lg:flex flex-col items-end shrink-0 relative z-10 min-w-[200px]">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acquisition Price</p>
                  <div className="text-5xl font-black text-emerald-600 tracking-tight mb-2">${domain.price.toLocaleString()}</div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <Lock className="w-3 h-3" /> Secure Transaction
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* 2. Domain Info Section (Stats) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <StatItem label="Length" value={`${domainLen} Chars`} icon={<BarChart3 className="w-5 h-5" />} />
                   <StatItem label="Extension" value={domain.tld} icon={<Globe className="w-5 h-5" />} />
                   <StatItem label="Type" value={domain.name.includes('-') ? 'Hyphenated' : 'Clean'} icon={<Check className="w-5 h-5" />} />
                   <StatItem label="Est. Value" value="Premium" icon={<TrendingUp className="w-5 h-5" />} />
                </div>

                {/* Description - UPDATED WITH CONDITIONAL DISPLAY */}
                <SectionCard title={`Domain Details for ${domain.name}`} icon={<FileText className="w-5 h-5" />}>
                   <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                      <p>
                        {seoDescription}
                      </p>
                      <p>
                        Securing <em>{domain.name}</em> instantly provides your business with a credible digital footprint. 
                        Don't miss the opportunity to own this unique digital asset.
                      </p>
                   </div>
                </SectionCard>

                {/* 3. Technical Specs / DNS Placeholder */}
                <SectionCard title="Technical Specifications" icon={<Server className="w-5 h-5" />}>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Registry</span>
                        <span className="font-medium text-slate-900">{domain.registry || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Transfer Type</span>
                        <span className="font-medium text-slate-900">{domain.transfer_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Renewal Price</span>
                        <span className="font-medium text-slate-900">{domain.renewal_price || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Listed Date</span>
                        <span className="font-medium text-slate-900">{listedDateDisplay}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-slate-50">
                        <span className="text-slate-500 text-sm">Registration Date</span>
                        <span className="font-medium text-slate-900">{registrationDateDisplay}</span>
                      </div>
                   </div>
                   {domain.technical_specifications && (
                     <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                       <p className="font-medium text-slate-700 mb-1">Additional Specs:</p>
                       {domain.technical_specifications}
                     </div>
                   )}
                   <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                      <Button variant="outline" size="sm" onClick={handleWhoisLookup} className="text-xs">
                         <Globe className="w-3 h-3 mr-2" /> View Detailed WHOIS
                      </Button>
                   </div>
                </SectionCard>

                {/* 5. Additional Info (Use Cases & USPs) */}
                {domain.use_cases && domain.use_cases.length > 0 && (
                   <SectionCard title={`Strategic Applications for ${domain.name}`} icon={<Target className="w-5 h-5" />}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {domain.use_cases.map((useCase, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                             <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                             <p className="text-sm text-slate-700 leading-snug">{useCase}</p>
                          </div>
                        ))}
                      </div>
                   </SectionCard>
                )}

                {domain.usp_points && domain.usp_points.length > 0 && (
                  <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl -mt-10 -mr-10"></div>
                    <div className="relative z-10">
                       <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-emerald-400" /> Why Choose {domain.name}?</h3>
                       <div className="grid gap-4">
                          {domain.usp_points.map((point, index) => (
                             <div key={index} className="flex gap-4">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2.5 shrink-0 box-content ring-4 ring-emerald-400/20" />
                               <p className="text-slate-200 leading-relaxed">{point}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Settings/Actions */}
              <div className="space-y-6">
                 
                 {/* Mobile Price (Visible only on Mobile) */}
                 <div className="lg:hidden bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Acquisition Price</p>
                    <div className="text-4xl font-black text-emerald-600 mb-2">${domain.price.toLocaleString()}</div>
                 </div>

                 {/* 6. Settings Section (Repurposed as Acquisition Actions) */}
                 <div className="bg-white rounded-2xl shadow-lg shadow-emerald-900/5 border border-emerald-100 p-6 sticky top-24">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <CreditCard className="w-5 h-5 text-emerald-600" /> Purchase Options
                    </h3>
                    
                    <div className="space-y-4">
                       {isWeb3Domain ? (
                          <Button size="lg" onClick={handleWeb3Redirect} className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700">
                             <Globe className="w-5 h-5 mr-2" /> View on Unstoppable
                          </Button>
                       ) : (
                          <>
                             <Button size="lg" onClick={handleBuyNow} disabled={domain.status !== 'available'} className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200">
                                <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                             </Button>
                             
                             <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={handleMakeOffer} disabled={domain.status !== 'available'} className="h-12 font-semibold">
                                   <Send className="w-4 h-4 mr-2" /> Offer
                                </Button>
                                <Button variant="outline" onClick={handleWhatsAppContact} className="h-12 font-semibold text-green-700 bg-green-50 border-green-200 hover:bg-green-100">
                                   <MessageCircle className="w-4 h-4 mr-2" /> Chat
                                </Button>
                             </div>
                             
                             <Button 
                                variant="secondary" 
                                onClick={handleGoDaddyBuy} 
                                className="w-full bg-[#FFD700] hover:bg-[#E6C200] text-slate-900 font-bold border border-yellow-400/50"
                             >
                                Buy via GoDaddy <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                             </Button>
                          </>
                       )}
                    </div>

                    {/* Timer */}
                    {timeLeft && timeLeft !== "EXPIRED" && (
                       <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="flex items-center justify-between text-slate-500 mb-2">
                             <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Offer Expires In</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                             <div><span className="block font-black text-slate-800">{timeLeft.days}</span><span className="text-[10px] uppercase">Days</span></div>
                             <div><span className="block font-black text-slate-800">{timeLeft.hours}</span><span className="text-[10px] uppercase">Hrs</span></div>
                             <div><span className="block font-black text-slate-800">{timeLeft.minutes}</span><span className="text-[10px] uppercase">Min</span></div>
                             <div><span className="block font-black text-slate-800">{timeLeft.seconds}</span><span className="text-[10px] uppercase">Sec</span></div>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* 4. Analytics Section (Market Demand) */}
                 {interestCount > 0 && (
                    <div className="bg-orange-50 rounded-xl border border-orange-100 p-5 shadow-sm">
                       <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white rounded-full text-orange-500 shadow-sm"><Flame className="w-5 h-5 fill-orange-500" /></div>
                          <h3 className="font-bold text-orange-900">High Demand</h3>
                       </div>
                       <p className="text-sm text-orange-800 leading-relaxed">
                          This domain has been viewed by <span className="font-bold">{interestCount} potential buyers</span> in the last 30 days. Action recommended.
                       </p>
                    </div>
                 )}
                 
                 {/* Trust Section */}
                 <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Buyer Protection</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                       <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                       <span>Domain ownership transfer guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                       <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                       <span>Secure escrow payment processing</span>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                       <Link to="/contact" className="text-sm text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors">
                          <Info className="w-4 h-4" /> Questions? Contact Broker
                       </Link>
                    </div>
                 </div>

              </div>

            </div>

             {/* Footer Links */}
            <div className="mt-16 pt-10 border-t border-slate-200">
               <h2 className="text-xl font-bold text-slate-900 mb-6">Explore More</h2>
               <div className="flex flex-wrap gap-4">
                  {domain.tld === '.com' && (
                    <Link to="/premium-com-domains" className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm">
                      Browse .COM domains <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                  <Link to="/premium-domain-pricing" className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm">
                     View pricing guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/premium-domains-for-sale" className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm">
                     All premium domains <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
               </div>
            </div>

            {/* Recommended Domains Section */}
            <div className="mt-12 pt-10 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                 <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                       <Sparkles className="w-6 h-6 text-emerald-600" /> Recommended Domains
                    </h2>
                    <p className="text-slate-500 max-w-2xl">
                       Hand-picked premium domains that might interest you.
                    </p>
                 </div>
              </div>
              
              {recLoading ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                       <div key={i} className="bg-slate-50 h-[280px] rounded-xl animate-pulse"></div>
                    ))}
                 </div>
              ) : recError ? (
                 <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-slate-500 mb-4">Failed to load recommendations.</p>
                    <Button variant="outline" size="sm" onClick={fetchRecommended} className="gap-2">
                       <RefreshCcw className="w-4 h-4" /> Retry
                    </Button>
                 </div>
              ) : recommended.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommended.map((item) => (
                       <DomainCard key={item.id} domain={item} />
                    ))}
                 </div>
              ) : (
                 <p className="text-slate-500 italic">No additional recommendations at this time.</p>
              )}
            </div>

          </motion.div>
          
          {showOfferForm && <MakeOfferForm domain={domain} onClose={() => setShowOfferForm(false)} />}
          <WhoisModal isOpen={isWhoisModalOpen} onClose={() => setIsWhoisModalOpen(false)} data={whoisData} loading={whoisLoading} error={whoisError} domain={domain.name} />
        </div>
      </div>
    </>
  );
};

export default DomainDetailPage;
