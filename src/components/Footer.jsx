import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Mail } from 'lucide-react'; // Corrected imports

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-3xl font-black text-white">RDM</span>
              <span className="sr-only">Rare Domains Marketplace</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Rare Domains Marketplace (RDM) is the premier destination for acquiring high-value, brandable, and exclusive domain names. Secure your digital future with us.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/marketplace" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Marketplace</Link></li>
              <li><Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Contact</Link></li>
              <li><Link to="/transfer" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Domain Transfer Guide</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors text-sm">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Connect</h3>
            <p className="text-slate-400 text-sm mb-4">Have questions? Reach out to us!</p>
            <a href="mailto:info@rdm.bz" className="inline-flex items-center text-slate-400 hover:text-emerald-400 transition-colors mb-4 text-sm">
              <Mail className="h-4 w-4 mr-2" /> info@rdm.bz
            </a>
            <div className="flex space-x-4 mt-4">
              <a href="https://twitter.com/rami_kassas" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com/rami.kassas" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400 transition-colors">
                <Instagram className="h-6 w-6" /> {/* Corrected to Instagram icon */}
                <span className="sr-only">Instagram</span> {/* Corrected capitalization */}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-12 pt-8 text-center">
          <span className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} Rare Domains Marketplace (RDM). All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;