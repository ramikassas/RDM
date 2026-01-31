
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import ProtectedRoute from '@/components/ProtectedRoute'; 
import { supabase } from '@/lib/customSupabaseClient';

// Public Pages
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

// Layouts & Components
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AdminLayout from '@/layouts/AdminLayout';

// Admin Pages
import DashboardHome from '@/pages/admin/DashboardHome';
import AdminDomains from '@/pages/admin/AdminDomains';
import AdminOffers from '@/pages/admin/AdminOffers';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminSales from '@/pages/admin/AdminSales';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminTransfers from '@/pages/admin/AdminTransfers';
import AdminSettings from '@/pages/admin/AdminSettings';

// Wrapper for Public Layout
const PublicLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col">
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Domain Query Helpers
const fetchAvailableDomains = () => 
  supabase.from('domains').select('*').eq('status', 'available').order('price', { ascending: false });

const fetchComDomains = () => 
  supabase.from('domains').select('*').eq('status', 'available').eq('tld', '.com').order('price', { ascending: false });

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* SITEMAP GENERATION - Single route serving pure XML via DOM replacement */}
          <Route path="/sitemap.xml" element={<SitemapHandler />} />

          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/marketplace" element={<PublicLayout><MarketplacePage /></PublicLayout>} />
          <Route path="/domain/:domainName" element={<PublicLayout><DomainDetailPage /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />
          <Route path="/privacy" element={<PublicLayout><PrivacyPage /></PublicLayout>} />
          <Route path="/transfer" element={<PublicLayout><TransferPage /></PublicLayout>} />
          
          {/* Category SEO Pages */}
          <Route 
            path="/premium-domains-for-sale" 
            element={
              <PublicLayout>
                <CategoryPage 
                  title="Premium Domains for Sale"
                  description="Browse available premium domains for purchase with one-time fees"
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
                  title="Premium Domain Marketplaces"
                  description="Compare premium domain platforms: GoDaddy, Namecheap, Afternic, Sedo, Squadhelp"
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
                  title="Premium Domain Pricing & Costs"
                  description="Understand premium domain prices, one-time fees and cost evaluation"
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
                  title="Find Premium Domains"
                  description="Search and discover available premium domains with advanced filters"
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
                  title="Sell Premium Domains"
                  description="List and sell your premium domains through our broker network"
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
                  title="Premium .COM Domains"
                  description="Exclusive collection of premium .COM domain names for sale"
                  keywordsCluster={["premium com domains", "premium com domain names", "buy premium com domains"]}
                  fetchDomains={fetchComDomains}
                />
              </PublicLayout>
            } 
          />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="domains" element={<AdminDomains />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="sales" element={<AdminSales />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="transfers" element={<AdminTransfers />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Legacy Admin Redirects */}
          <Route path="/0955" element={<Navigate to="/admin" replace />} />
          <Route path="/leads" element={<Navigate to="/admin/offers" replace />} />

          {/* Fallback */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
