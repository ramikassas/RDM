import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const navItems = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleSignOut = async () => {
    // Close menu immediately for better UX
    setIsMobileMenuOpen(false);
    
    try {
      // Call signOut from context - this now clears state immediately
      await signOut();
      
      // Force navigation to home page and replace history entry
      navigate('/', { replace: true });
      
      toast({
        title: "Signed Out",
        description: "You have been securely logged out."
      });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback navigation
      navigate('/', { replace: true }); 
    }
  };

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <span className="text-2xl font-black text-slate-900">RDM</span>
            <span className="sr-only">Rare Domains Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              {navItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `font-medium transition-colors hover:text-emerald-600 ${
                        isActive ? 'text-emerald-600' : 'text-slate-600'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
              {user && (
                <li>
                  <NavLink
                    to="/0955"
                    className={({ isActive }) =>
                      `font-medium transition-colors hover:text-emerald-600 ${
                        isActive ? 'text-emerald-600' : 'text-slate-600'
                      }`
                    }
                  >
                    Dashboard
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Auth Buttons / User Icon for Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <Button variant="ghost" className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-slate-100">
                  <User className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">User Menu</span>
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50 transform origin-top-right">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-medium text-slate-900 truncate mt-1" title={user.email}>{user.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Sign In button intentionally hidden from public interface */
              null
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-emerald-600"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Toggle mobile menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden bg-white border-t border-slate-100 shadow-md overflow-hidden"
          >
            <nav className="px-4 pt-3 pb-6 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/0955"
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
              )}

              {user && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="px-4 mb-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-medium text-slate-900 truncate mt-1">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;