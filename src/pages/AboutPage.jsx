import React from 'react';
import { Shield, TrendingUp, Users, Award, Twitter, ArrowRight, Globe, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "Rare Domains Marketplace (RDM)",
      "founder": "Rami Kassas",
      "description": "Rare Domains Marketplace (RDM) is a premium domain marketplace connecting visionaries with exclusive digital assets.",
      "url": "https://rdm.bz"
    }
  };

  return (
    <>
      <SEO 
        title="About Rare Domains Marketplace (RDM)" 
        description="Learn about our premium domain marketplace. Discover our mission to connect buyers with valuable domain names and support digital entrepreneurship."
        schema={aboutSchema}
      />

      <div className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                  Redefining Digital <span className="text-emerald-600">Asset Acquisition</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Rare Domains Marketplace (RDM) is more than a marketplace; it's a curated vault of premium digital real estate. 
                  We connect visionary entrepreneurs with the rare domains that define industry leaders.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumbs items={[{ label: 'About Us', path: null }]} />

          {/* Mission & Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 my-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Our Mission</h2>
              <div className="prose prose-lg text-slate-600">
                <p className="mb-4">
                  In the digital age, your domain is your identity. It is the first impression, the foundation of trust, and the cornerstone of your brand's equity.
                </p>
                <p>
                  Our mission at RDM is to democratize access to elite-tier domain names. We believe that every ambitious project deserves a world-class address. By curating only the most brandable, memorable, and concise domains, we eliminate the noise and provide a clear path to owning a premium digital asset.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Curated</h3>
                  <p className="text-sm text-slate-500">Hand-picked for quality</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Secure</h3>
                  <p className="text-sm text-slate-500">Protected transactions</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-blue-50 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">What Sets Us Apart</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Exclusive Inventory</h4>
                      <p className="text-slate-600 text-sm">We don't list everything. We list the best. Our portfolio focuses on short, keyword-rich, and brandable .com and web3 domains.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Verified Ownership</h4>
                      <p className="text-slate-600 text-sm">Every domain on our platform is verified for ownership and clean history, ensuring a risk-free acquisition.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 mt-1">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Seamless Transfer</h4>
                      <p className="text-slate-600 text-sm">Our automated transfer processes and expert support team ensure you have full control of your new domain in record time.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Founder Section */}
          <section className="mb-20">
             <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                   <div className="w-full md:w-1/3">
                      <div className="relative w-48 h-64 md:w-56 md:h-72 mx-auto md:ml-0 overflow-hidden rounded-2xl border border-slate-700 shadow-2xl"> {/* Adjusted dimensions */}
                        <img 
                          src="https://horizons-cdn.hostinger.com/ee7df4d6-7fd2-45d0-8d5a-3495011e4290/6f612353b77a278934c95261de52dc7a.png"
                          alt="Rami Kassas - Founder"
                          className="w-full h-full object-cover object-top" // object-top to ensure head is visible
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-6">
                          <p className="font-bold text-lg">Rami Kassas</p>
                          <p className="text-emerald-400 text-sm">Founder & CEO</p>
                        </div>
                      </div>
                   </div>
                   
                   <div className="w-full md:w-2/3">
                      <h2 className="text-3xl md:text-4xl font-bold mb-6">Meet the Founder</h2>
                      <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                        <p>
                          Rami Kassas combines deep technical expertise with a sharp eye for digital market trends. With over 7 years of experience in web development and digital strategy, Rami recognized a gap in the market for a curated, high-trust domain marketplace.
                        </p>
                        <p>
                          "A domain is not just a URL; it is the single most important asset in a digital-first economy. My goal with Rare Domains Marketplace (RDM) is to provide businesses with the assets they need to scale without limits."
                        </p>
                      </div>
                      
                      <div className="mt-8 flex flex-wrap gap-4">
                        <a 
                          href="https://x.com/rami_kassas" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-300 font-medium border border-slate-700"
                        >
                          <Twitter className="h-5 w-5 mr-2 text-blue-400" />
                          Follow on X
                        </a>
                        <Link to="/contact">
                           <Button variant="outline" className="bg-transparent border-slate-600 text-white hover:bg-white hover:text-slate-900 h-12 px-6 text-base">
                             Contact Rami
                           </Button>
                        </Link>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* CTA Section */}
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to Secure Your Legacy?</h2>
            <p className="text-lg text-slate-600 mb-8">
              Browse our collection of rare domains and find the perfect foundation for your next venture.
            </p>
            <Link to="/marketplace">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-full shadow-lg shadow-emerald-200">
                Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;