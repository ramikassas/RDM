
import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Globe, 
  Inbox, 
  ShoppingCart, 
  CreditCard, 
  Settings, 
  Menu, 
  X,
  LogOut,
  MessageSquare,
  ArrowLeftRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout = () => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Domains', path: '/admin/domains', icon: Globe },
    { label: 'Offers', path: '/admin/offers', icon: Inbox },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Sales', path: '/admin/sales', icon: CreditCard },
    { label: 'Messages', path: '/admin/messages', icon: MessageSquare },
    { label: 'Transfers', path: '/admin/transfers', icon: ArrowLeftRight },
    { label: 'Pages (SEO)', path: '/admin/pages', icon: FileText },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    // Navigate immediately to home to prevent ProtectedRoute from showing LoginModal
    // This removes the component from the tree before the user state is cleared
    navigate('/', { replace: true });
    
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 h-screen w-[240px] bg-slate-900 text-white z-50 transition-transform duration-300 ease-in-out shadow-xl flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <span className="text-xl font-black tracking-tight text-white">
            RDM<span className="text-emerald-500">.</span>Admin
          </span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                  isActive 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
               {user?.email?.[0]?.toUpperCase() || 'A'}
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium text-white truncate">Admin</p>
               <p className="text-xs text-slate-500 truncate">{user?.email}</p>
             </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 mb-2"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
          <Link to="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <Globe className="mr-2 h-4 w-4" />
              Go to Website
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] min-w-0 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="mr-4 md:hidden text-slate-500 hover:text-slate-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
