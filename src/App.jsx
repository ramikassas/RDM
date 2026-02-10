
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import { CartProvider } from '@/hooks/useCart';
import ProtectedRoute from '@/components/ProtectedRoute'; 
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2 } from 'lucide-react';

// Core Layouts & Components (Eager Load)
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollPositionManager from '@/components/ScrollPositionManager';

// Public Pages (Eager Load for Speed)
import HomePage from '@/pages/HomePage';
import MarketplacePage from '@/pages/MarketplacePage';
import DomainDetailPage from '@/pages/DomainDetailPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import TermsPage from '@/pages/TermsPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TransferPage from '@/pages/TransferPage';
import NotFoundPage from '@/pages/NotFoundPage';
import SitemapHandler from '@/pages/SitemapHandler';
import CategoryPage from '@/pages/CategoryPage';

// Admin Pages (Lazy Load for Bundle Optimization)
const AdminLayout = React.lazy(() => import('@/layouts/AdminLayout'));
const DashboardHome = React.lazy(() => import('@/pages/admin/DashboardHome'));
const AdminDomains = React.lazy(() => import('@/pages/admin/AdminDomains'));
const AdminOffers = React.lazy(() => import('@/pages/admin/AdminOffers'));
const AdminOrders = React.lazy(() => import('@/pages/admin/AdminOrders'));
const AdminSales = React.lazy(() => import('@/pages/admin/AdminSales'));
const AdminMessages = React.lazy(() => import('@/pages/admin/AdminMessages'));
const AdminTransfers = React.lazy(() => import('@/pages/admin/AdminTransfers'));
const AdminSettings = React.lazy(() => import('@/pages/admin/AdminSettings'));
const AdminPages = React.lazy(() => import('@/pages/admin/AdminPages'));
const DataMigration = React.lazy(() => import('@/pages/admin/DataMigration'));
const SEOManagerPage = React.lazy(() => import('@/pages/admin/SEOManagerPage'));
const FixSEOImages = React.lazy(() => import('@/pages/admin/FixSEOImages'));

// Loading Spinner for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading...</p>
    </div>
  </div>
);

const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Component to inject anti-caching meta tags
const CacheBuster = () => {
  useEffect(() => {
    // Add meta tags to head to prevent browser caching of the HTML
    const metas = [
      { name: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { name: 'Pragma', content: 'no-cache' },
      { name: 'Expires', content: '0' }
    ];

    metas.forEach(metaDef => {
      // Check if exists, update or create
      let meta = document.querySelector(`meta[http-equiv="${metaDef.name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.httpEquiv = metaDef.name;
        document.head.appendChild(meta);
      }
      meta.content = metaDef.content;
    });
  }, []);
  return null;
};

const fetchAvailableDomains = () => 
  supabase.from('domains').select('*').eq('status', 'available').order('price', { ascending: false });

const fetchComDomains = () => 
  supabase.from('domains').select('*').eq('status', 'available').eq('tld', '.com').order('price', { ascending: false });

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <CacheBuster />
          <ScrollPositionManager>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/sitemap.xml" element={<SitemapHandler />} />

                <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
                <Route path="/marketplace" element={<PublicLayout><MarketplacePage /></PublicLayout>} />
                
                {/* Primary Domain Route - Keeps SEO unified */}
                <Route path="/domain/:domainName" element={<PublicLayout><DomainDetailPage /></PublicLayout>} />
                
                <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
                <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
                <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
                <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
                <Route path="/transfer" element={<PublicLayout><TransferPage /></PublicLayout>} />
                
                <Route 
                  path="/premium-domains-for-sale" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="premium-domains-for-sale"
                        defaultTitle="Premium Domains for Sale"
                        defaultDescription="Premium domains for sale. Browse our collection of valuable domain names available for immediate purchase or negotiation."
                        keywordsCluster={["premium domains for sale", "premium domain names for sale", "buy premium domain", "premium domain purchase", "premium com domains for sale"]}
                        fetchDomains={fetchAvailableDomains}
                      />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/marketplaces" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="marketplaces"
                        defaultTitle="Premium Domain Marketplaces"
                        defaultDescription="Explore domain marketplaces. Compare premium domain platforms and find the best place to buy and sell valuable domain names."
                        keywordsCluster={["godaddy premium domains", "namecheap premium domain", "afternic premium network", "sedo mls premium"]}
                        fetchDomains={fetchAvailableDomains}
                      />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/premium-domain-pricing" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="premium-domain-pricing"
                        defaultTitle="Premium Domain Pricing & Costs"
                        defaultDescription="Premium domain pricing guide. Understand domain valuation, pricing factors, and investment potential for premium domain names."
                        keywordsCluster={["premium domain price", "premium domain cost", "cheap premium domains", "premium domain renewal price"]}
                        fetchDomains={fetchAvailableDomains}
                      />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/find-premium-domains" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="find-premium-domains"
                        defaultTitle="Find Premium Domains"
                        defaultDescription="Find premium domains for your business. Search our extensive collection of high-value domain names available for purchase."
                        keywordsCluster={["premium domain search", "find premium domains", "search for premium domains", "available premium domains"]}
                        fetchDomains={fetchAvailableDomains}
                      />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/sell-premium-domains" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="sell-premium-domains"
                        defaultTitle="Sell Premium Domains"
                        defaultDescription="Sell your premium domain names. List your valuable domains on our marketplace and connect with serious buyers worldwide."
                        keywordsCluster={["sell premium domain", "sell premium domain names", "premium domain broker", "premium resale domain"]}
                        fetchDomains={fetchAvailableDomains}
                      />
                    </PublicLayout>
                  } 
                />
                <Route 
                  path="/premium-com-domains" 
                  element={
                    <PublicLayout>
                      <CategoryPage 
                        slug="premium-com-domains"
                        defaultTitle="Premium .COM Domains"
                        defaultDescription="Premium .COM domains for sale. Invest in valuable .COM domain names with strong branding potential and market demand."
                        keywordsCluster={["premium com domains", "premium com domain names", "buy premium com domains"]}
                        fetchDomains={fetchComDomains}
                      />
                    </PublicLayout>
                  } 
                />

                {/* Admin Routes - Protected & Lazy Loaded */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="domains" element={<AdminDomains />} />
                  <Route path="offers" element={<AdminOffers />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="sales" element={<AdminSales />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="transfers" element={<AdminTransfers />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="migrate" element={<DataMigration />} />
                  <Route path="seo-manager" element={<SEOManagerPage />} />
                  <Route path="fix-seo-images" element={<FixSEOImages />} />
                </Route>

                <Route path="/0955" element={<Navigate to="/admin" replace />} />
                <Route path="/leads" element={<Navigate to="/admin/offers" replace />} />

                <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
              </Routes>
            </Suspense>
          </ScrollPositionManager>
          <Toaster />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
