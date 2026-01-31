import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Mail, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import SEO from '@/components/SEO';

const NotFoundPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <SEO 
        title="Page Not Found | Rare Domains Marketplace" 
        description="The page you are looking for doesn't exist. Use our search or navigation to find premium domains."
      />
      
      <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8 bg-slate-50/50">
        <div className="max-w-3xl w-full">
          
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 text-center"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-semibold border border-red-100">
                <AlertCircle className="w-4 h-4" />
                <span>Error 404</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                Oops! This page is <span className="text-emerald-600">off the market</span>.
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Don't worry—the rest of our site is working perfectly!
              </p>
            </div>

            {/* Search Section */}
            <div className="max-w-md mx-auto">
              <label className="text-sm font-semibold text-slate-700 mb-2 block text-left">
                Looking for a specific domain?
              </label>
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  type="text"
                  placeholder="Search premium domains..."
                  className="pl-10 h-12 bg-white border-slate-200 focus:ring-emerald-500 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="absolute right-1 top-1 h-10 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Search
                </Button>
              </form>
            </div>

            {/* Quick Navigation Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Helpful Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                <Link to="/">
                  <Card className="p-4 hover:shadow-md transition-shadow border-slate-200 group cursor-pointer bg-white">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Home className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">Home Page</div>
                    </div>
                  </Card>
                </Link>

                <Link to="/marketplace">
                  <Card className="p-4 hover:shadow-md transition-shadow border-slate-200 group cursor-pointer bg-white">
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">Marketplace</div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Support Link */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-4">
              <HelpCircle className="w-4 h-4" />
              <span>Need assistance?</span>
              <Link to="/contact" className="text-emerald-600 font-semibold hover:underline flex items-center gap-1">
                Contact Support <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;