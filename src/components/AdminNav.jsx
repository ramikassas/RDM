import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  MessageSquare, 
  Menu, 
  X, 
  LogOut, 
  Globe,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNav = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location, currentTab]);

  const isActive = (path, tab) => {
    if (path === '/0955') return location.pathname === '/0955';
    if (location.pathname === '/leads') {
      return tab ? currentTab === tab : !currentTab;
    }
    return false;
  };

  const navItems = [
    {
      label: 'Inventory',
      description: 'Manage Domains',
      path: '/0955',
      tab: null,
      icon: LayoutDashboard
    },
    {
      label: 'Transactions',
      description: 'Sales & Orders',
      path: '/leads',
      tab: 'sales',
      icon: ShoppingCart
    },
    {
      label: 'Offers & Bids',
      description: 'Incoming Offers',
      path: '/leads',
      tab: 'offers',
      icon: DollarSign
    },
    {
      label: 'Inquiries',
      description: 'Messages',
      path: '/leads',
      tab: 'messages',
      icon: MessageSquare
    }
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-800/50">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="bg-emerald-500 text-white p-1 rounded-lg">
             <Globe className="w-5 h-5" />
          </span>
          Admin<span className="text-emerald-400">Panel</span>
        </h2>
        <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
          Management Console
        </p>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.tab);
          const to = item.tab ? `${item.path}?tab=${item.tab}` : item.path;

          return (
            <Link
              key={item.label}
              to={to}
              className={cn(
                "group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden",
                active 
                  ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="activeNavIndicator"
                  className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                )}
              />
              <div className="flex-1">
                <span className="block font-semibold">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            {user?.email?.[0].toUpperCase() || 'A'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Administrator</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => signOut()} 
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 group transition-colors"
        >
          <LogOut className="mr-2 h-4 w-4 group-hover:text-red-400" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      {/* Changed from fixed to sticky positioning to avoid overlapping header/footer */}
      <div className="hidden md:block md:w-72 md:flex-shrink-0">
        <div className="sticky top-16 flex flex-col h-[calc(100vh-4rem)] bg-slate-900 shadow-2xl overflow-hidden">
          <NavContent />
        </div>
      </div>

      {/* Mobile Header */}
      {/* Positioned at top-16 to sit below the global header */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 h-16 flex items-center justify-between shadow-md">
        <div className="font-bold text-white text-lg flex items-center gap-2">
           <span className="bg-emerald-500 text-white p-1 rounded">
             <Globe className="w-4 h-4" />
          </span>
          AdminPanel
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="text-slate-300">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
              style={{ top: '0' }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-slate-900 z-50 md:hidden shadow-2xl"
            >
              <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <NavContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminNav;