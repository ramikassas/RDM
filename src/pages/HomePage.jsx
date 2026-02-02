
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Zap, ArrowRight, CheckCircle, Star, Award, Globe, ShieldCheck, MousePointerClick, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/customSupabaseClient';
import DomainCard from '@/components/DomainCard';
import SEOHead from '@/components/SEOHead';
import { usePageSEO } from '@/hooks/usePageSEO';

const HomePage = () => {
  const [featuredDomains, setFeaturedDomains] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { seoData, loading: seoLoading } = usePageSEO('home');

  useEffect(() => {
    fetchFeaturedDomains();
  }, []);

  const fetchFeaturedDomains = async () => {
    const {
      data,
      error
    } = await supabase.from('domains').select('*').eq('featured', true).eq('status', 'available').limit(6);
    if (!error && data) {
      setFeaturedDomains(data);
    }
  };

  const handleSearch = e => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/marketplace?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rare Domains Marketplace (RDM)",
    "url": "https://rdm.bz",
    "logo": "https://rdm.bz/logo.png",
    "founder": {
      "@type": "Person",
      "name": "Rami Kassas"
    },
    "description": "Premium marketplace for rare and exclusive domain names.",
    "sameAs": ["https://twitter.com/rdm_bz", "https://linkedin.com/company/rdm-bz"]
  };

  const heroTitle = seoData?.h1_title || "Own the Perfect Domain";
  const heroSubtitle = seoData?.page_heading || "Secure exclusive, high-value digital real estate that defines authority. Build your legacy on a foundation of rarity.";

  return (
    <>
      <SEOHead 
        seoData={seoData}
        defaultTitle="RDM - Rare Domains Marketplace (RDM) - Buy Rare & Premium Domains" 
        defaultDescription="Discover premium domain names for sale. Browse our curated marketplace of high-value domains with investment potential. Find your perfect domain today." 
        defaultKeywords="rare domains, premium domains, buy domains, domain marketplace, brandable domains, exclusive digital assets, Rare Domains Marketplace"
        schema={organizationSchema} 
      />

      <div className="bg-slate-50 min-h-screen font-sans">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border-b border-slate-100">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-100 rounded-full filter blur-3xl opacity-40"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.6
              }}>
                <span className="inline-block py-1 px-3 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-bold mb-6 tracking-wide">
                  RARE DOMAINS MARKETPLACE
                </span>
                
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                  {heroTitle.includes("Perfect Domain") ? (
                    <>Own the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Perfect Domain</span></>
                  ) : (
                    heroTitle
                  )}
                </h1>
                
                <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {heroSubtitle}
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                  <div className="relative flex gap-2 bg-white p-2 rounded-xl shadow-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input type="text" placeholder="Search for your dream domain (e.g. AI, Tech, Finance)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-transparent text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium" aria-label="Search domains" />
                    </div>
                    <Button type="submit" size="lg" className="h-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold rounded-lg transition-transform active:scale-95">
                      Search
                    </Button>
                  </div>
                </form>

                <div className="flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
                  <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Verified Ownership</span>
                  <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Secure Escrow</span>
                  <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> Instant Transfer</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Premium Domains Matter</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">A premium domain is more than an address it's an asset that appreciates. It builds instant trust, improves conversion rates, and dominates search results.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors hover:shadow-lg">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 text-emerald-600">
                  <Star className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Brand Authority</h3>
                <p className="text-slate-600 leading-relaxed">
                  Establish instant credibility with a short, memorable, and industry-defining domain name that customers trust implicitly.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors hover:shadow-lg">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 text-blue-600">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Investment Value</h3>
                <p className="text-slate-600 leading-relaxed">
                  Premium domains are finite digital assets. Like prime real estate, they retain value and appreciate over time.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-100 transition-colors hover:shadow-lg">
                <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center shadow-sm mb-6 text-purple-600">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Accelerated Growth</h3>
                <p className="text-slate-600 leading-relaxed">
                  Lower your marketing costs with better organic type-in traffic, higher click-through rates, and superior SEO potential.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Domains */}
        {featuredDomains.length > 0 && <section className="py-24 bg-slate-50 border-t border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-12">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">Featured Assets</h2>
                  <p className="text-slate-600">Handpicked for their exceptional quality and potential.</p>
                </div>
                <Link to="/marketplace">
                  <Button variant="outline" className="hidden md:flex border-slate-300 text-slate-700 hover:bg-white hover:text-emerald-600">
                    View All Domains <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredDomains.map(domain => <DomainCard key={domain.id} domain={domain} viewMode='grid' />)}
              </div>

              <div className="mt-12 text-center md:hidden">
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full border-slate-300 text-slate-700">
                    View All Domains <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>}

        {/* Informational Section (SEO & Education) */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">Knowledge Base</span>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mt-2 mb-6">Mastering Your Digital Identity</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Understanding the value of premium domains is the first step toward building a dominant online presence. 
                  Here is everything you need to know about navigating the world of digital real estate.
                </p>
              </div>

              <div className="space-y-16">
                {/* 1. What are Domains & Benefits */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                      <Globe className="w-6 h-6 text-emerald-600 mr-3" />
                      What is a Domain Name?
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">A domain name is your unique address on the internet the digital entry point to your brand (e.g., yourbrand.com). It serves as a user friendly translation of the complex IP addresses that computers use to communicate. However, in today's digital first economy, it is far more than just a technical necessity; it is the cornerstone of your brand's identity.</p>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">Why It Matters</h4>
                    <ul className="space-y-2 text-slate-600">
                      <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" /> <span><strong>First Impressions:</strong> It's often the first thing customers see.</span></li>
                      <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" /> <span><strong>Brand Protection:</strong> Owning your name prevents competitors from capitalizing on your identity.</span></li>
                      <li className="flex items-start"><CheckCircle className="w-5 h-5 text-emerald-500 mr-2 mt-0.5 shrink-0" /> <span><strong>Credibility:</strong> Premium domains signal authority and longevity.</span></li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                      <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
                      The Domain Marketplace
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      The domain aftermarket operates much like traditional real estate. High-quality, "beachfront" digital properties are scarce. 
                      Generic, one-word, and short acronym domains are highly sought after because they are easy to remember and impossible to duplicate.
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Our marketplace specializes in these elite assets. We bridge the gap between investors holding valuable legacy domains and forward-thinking businesses ready to scale.
                    </p>
                  </div>
                </div>

                {/* 2. Extensions & Choosing */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="col-span-1 md:col-span-3 mb-4">
                     <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center">
                      <Lightbulb className="w-6 h-6 text-amber-500 mr-3" />
                      Choosing the Right Extension
                    </h3>
                    <p className="text-slate-600 max-w-3xl">While the part before the dot defines your brand, the Top Level Domain (TLD) the part after the dot defines your neighborhood.</p>
                  </div>
                  
                  <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-3xl font-black text-slate-900 mb-2">.com</div>
                      <p className="text-sm text-slate-600 font-medium mb-3 uppercase tracking-wider text-emerald-600">The Gold Standard</p>
                      <p className="text-sm text-slate-500">
                        The most recognized and trusted extension globally. It implies authority and is the default choice for most users.
                      </p>
                    </CardContent>
                  </Card>

                   <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-3xl font-black text-slate-900 mb-2">.io / .ai</div>
                      <p className="text-sm text-slate-600 font-medium mb-3 uppercase tracking-wider text-purple-600">Tech & Innovation</p>
                      <p className="text-sm text-slate-500">
                        Extremely popular among startups, SaaS companies, and artificial intelligence ventures. Modern and snappy.
                      </p>
                    </CardContent>
                  </Card>

                   <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-3xl font-black text-slate-900 mb-2">.org / .net</div>
                      <p className="text-sm text-slate-600 font-medium mb-3 uppercase tracking-wider text-blue-600">Trust & Legacy</p>
                      <p className="text-sm text-slate-500">
                        Established alternatives. Great for organizations, communities, and infrastructure services.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* 3. SEO & Tips */}
                <div className="bg-slate-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500 rounded-full filter blur-3xl opacity-20"></div>
                   
                   <div className="relative z-10 grid md:grid-cols-2 gap-10">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center text-white">
                          <TrendingUp className="w-6 h-6 text-emerald-400 mr-3" />
                          SEO & Business Impact
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-4">A premium domain doesn't just look good on a business card it performs. High quality domains are easier to link to, easier to remember, and often enjoy higher Click-Through Rates (CTR) in search engines.</p>
                        <p className="text-slate-300 leading-relaxed">
                          Search engines prioritize user experience. When users see a credible, clean domain name, they are more likely to click. This "type-in traffic" is free, recurring marketing for your business.
                        </p>
                      </div>

                      <div>
                         <h3 className="text-2xl font-bold mb-4 flex items-center text-white">
                          <MousePointerClick className="w-6 h-6 text-emerald-400 mr-3" />
                          Tips for Selection
                        </h3>
                        <ul className="space-y-4">
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">1</span>
                            <span className="text-slate-300 text-sm"><strong>Keep it Short:</strong> Shorter names are easier to recall and type on mobile devices.</span>
                          </li>
                          <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">2</span>
                            <span className="text-slate-300 text-sm"><strong>Pass the Radio Test:</strong> If you say it out loud, people should know how to spell it instantly.</span>
                          </li>
                           <li className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
                            <span className="text-slate-300 text-sm"><strong>Avoid Hyphens/Numbers:</strong> These often confuse users and lower perceived credibility.</span>
                          </li>
                        </ul>
                      </div>
                   </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Trust/CTA Section */}
        <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Award className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-4xl font-black mb-6">Secure Your Future Today</h2>
            <p className="text-xl text-slate-300 mb-10 leading-relaxed">
              Don't let the perfect domain slip away. Join hundreds of visionary entrepreneurs who have secured their brand's future on Rare Domains Marketplace (RDM).
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/marketplace">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-10 h-14 rounded-full w-full sm:w-auto text-lg">
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-white hover:text-slate-900 font-bold px-10 h-14 rounded-full w-full sm:w-auto text-lg">
                  Contact Broker
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
export default HomePage;
