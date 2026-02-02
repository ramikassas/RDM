
import React, { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Grid, List, Filter, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import DomainCard from '@/components/DomainCard';
import SEOHead from '@/components/SEOHead';
import { usePageSEO } from '@/hooks/usePageSEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [domains, setDomains] = useState([]);
  const [filteredDomains, setFilteredDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const { seoData } = usePageSEO('marketplace');
  
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTLD, setSelectedTLD] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 100000]); // Max price default
  const [lengthRange, setLengthRange] = useState([1, 20]);
  const [sortBy, setSortBy] = useState('newest'); 
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Derived Options
  const [uniqueTLDs, setUniqueTLDs] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(100000);

  // 1. Fetch Domains on Mount
  useEffect(() => {
    fetchDomains();
  }, []);

  // 2. Sync Search Query from URL
  useEffect(() => {
    const query = searchParams.get('search') || '';
    if (query !== searchQuery) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // 3. Apply Filters
  useEffect(() => {
    applyFilters();
  }, [domains, searchQuery, selectedTLD, selectedCategories, priceRange, lengthRange, sortBy]);

  const fetchDomains = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDomains(data);
      
      // Calculate derived filter options
      const tlds = [...new Set(data.map(d => d.tld).filter(Boolean))];
      const cats = [...new Set(data.map(d => d.category).filter(Boolean))];
      const maxP = Math.max(...data.map(d => d.price || 0), 100000);
      
      setUniqueTLDs(tlds);
      setUniqueCategories(cats);
      setMaxPrice(maxP);
      setPriceRange([0, maxP]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...domains];

    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(domain => {
        const nameMatch = (domain.name || '').toLowerCase().includes(query);
        const descMatch = (domain.description || '').toLowerCase().includes(query);
        const catMatch = (domain.category || '').toLowerCase().includes(query);
        return nameMatch || descMatch || catMatch;
      });
    }

    // TLD Filter
    if (selectedTLD.length > 0) {
      filtered = filtered.filter(domain => selectedTLD.includes(domain.tld));
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(domain => selectedCategories.includes(domain.category));
    }

    // Price Range Filter
    filtered = filtered.filter(domain => 
      domain.price >= priceRange[0] && domain.price <= priceRange[1]
    );

    // Length Filter (Name length without TLD dots if possible, though standard is full string)
    // Assuming domain.name includes TLD, let's strip TLD for length calculation typically
    filtered = filtered.filter(domain => {
      const nameOnly = domain.name.split('.')[0];
      return nameOnly.length >= lengthRange[0] && nameOnly.length <= lengthRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'length-asc':
        filtered.sort((a, b) => a.name.length - b.name.length);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
    }

    setFilteredDomains(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleTLD = (tld) => {
    setSelectedTLD(prev => 
      prev.includes(tld) ? prev.filter(t => t !== tld) : [...prev, tld]
    );
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTLD([]);
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setLengthRange([1, 20]);
    setSortBy('newest');
  };

  const pageTitle = seoData?.h1_title || "Marketplace";
  const pageHeading = seoData?.page_heading || `Found ${filteredDomains.length} premium assets matching your criteria`;

  return (
    <>
      <SEOHead 
        seoData={seoData}
        defaultTitle="Premium Domain Marketplace | Buy & Sell Exclusive Digital Assets" 
        defaultDescription="Browse premium domains for sale with advanced filters. Search by price, category, and TLD. Find valuable domain names for your business or investment."
        defaultKeywords="buy domains, domain filter, domain search, premium domains, short domains, brandable domains"
        canonicalUrl="https://rdm.bz/marketplace"
      />

      <div className="bg-slate-50 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumbs items={[{ label: 'Marketplace', path: null }]} />
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">{pageTitle}</h1>
              <p className="text-lg text-slate-600">
                {pageHeading}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500 hidden sm:inline">Sort by:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 shadow-sm"
              >
                <option value="newest">Newest Listed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="length-asc">Length: Shortest First</option>
              </select>

               <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Filters - Desktop */}
            <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                  </h3>
                  <button onClick={resetFilters} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                    Reset All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search Input in Sidebar */}
                  <div>
                     <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Keyword</Label>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                     </div>
                  </div>

                  {/* Price Range Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Range</Label>
                       <span className="text-xs font-medium text-slate-700">
                         ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                       </span>
                    </div>
                    <Slider 
                      defaultValue={[0, maxPrice]} 
                      value={priceRange}
                      max={maxPrice} 
                      step={100} 
                      min={0}
                      onValueChange={setPriceRange}
                      className="py-4"
                    />
                  </div>

                  {/* Length Slider */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                       <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name Length</Label>
                       <span className="text-xs font-medium text-slate-700">
                         {lengthRange[0]} - {lengthRange[1]} chars
                       </span>
                    </div>
                    <Slider 
                      defaultValue={[1, 20]} 
                      value={lengthRange}
                      max={20} 
                      step={1} 
                      min={1}
                      onValueChange={setLengthRange}
                      className="py-4"
                    />
                  </div>

                  {/* Accordion Filters - UPDATED ORDER: TLD FIRST, THEN CATEGORIES */}
                  <Accordion type="multiple" defaultValue={['tld', 'category']} className="w-full">
                    
                    {/* TLDs Section - Moved before Categories */}
                    <AccordionItem value="tld">
                      <AccordionTrigger className="text-sm font-bold text-slate-800 hover:no-underline">
                        Extensions (TLD)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {uniqueTLDs.map(tld => (
                            <div key={tld} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`tld-${tld}`} 
                                checked={selectedTLD.includes(tld)}
                                onCheckedChange={() => toggleTLD(tld)}
                              />
                              <label
                                htmlFor={`tld-${tld}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 uppercase"
                              >
                                .{tld}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Categories Section - Moved after TLDs */}
                    <AccordionItem value="category">
                      <AccordionTrigger className="text-sm font-bold text-slate-800 hover:no-underline">
                        Categories
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-1">
                          {uniqueCategories.map(cat => (
                            <div key={cat} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`cat-${cat}`} 
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={() => toggleCategory(cat)}
                              />
                              <label
                                htmlFor={`cat-${cat}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                              >
                                {cat}
                              </label>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                  </Accordion>
                </div>
              </div>
            </div>

            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden mb-4">
               <Button 
                 variant="outline" 
                 onClick={() => setShowMobileFilters(!showMobileFilters)}
                 className={`w-full flex items-center justify-center gap-2 ${showMobileFilters ? 'bg-slate-900 text-white' : ''}`}
               >
                 <SlidersHorizontal className="h-4 w-4" />
                 {showMobileFilters ? 'Hide Filters' : 'Show Advanced Filters'}
               </Button>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-200 border-dashed">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                  <p className="text-slate-500 font-medium">Scanning marketplace...</p>
                </div>
              ) : filteredDomains.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                     <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No domains found</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    We couldn't find any domains matching your specific criteria. Try adjusting your price range or removing some filters.
                  </p>
                  <Button onClick={resetFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}
                >
                  {filteredDomains.map((domain) => (
                    <DomainCard key={domain.id} domain={domain} viewMode={viewMode} />
                  ))}
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplacePage;
