import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const TermsPage = () => {
  const termsSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service - Rare Domains Marketplace (RDM)",
    "description": "Read the Terms of Service for Rare Domains Marketplace (RDM) to understand the rules and regulations for using our platform.",
    "url": "https://rdm.bz/terms",
    "publisher": {
      "@type": "Organization",
      "name": "Rare Domains Marketplace (RDM)",
      "url": "https://rdm.bz"
    }
  };

  return (
    <>
      <SEO 
        title="Terms of Service | Rare Domains Marketplace (RDM)" 
        description="Read our terms of service. Understand the rules and conditions governing the use of our premium domain marketplace platform."
        keywords="terms of service, RDM terms, legal agreement, domain purchase terms, Rare Domains Marketplace"
        schema={termsSchema}
      />

      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Terms of Service', path: null }]} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-slate-100"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 text-center">
              Terms of Service
            </h1>
            <p className="text-center text-slate-600 mb-10 text-lg">
              Last updated: <time dateTime="2025-12-01">December 01, 2025</time>
            </p>

            <div className="prose prose-lg max-w-none text-slate-700">
              <p>
                Welcome to Rare Domains Marketplace (RDM)! These Terms of Service ("Terms") govern your access to and use of our website, services, and products (collectively, the "Services"). By accessing or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, please do not use our Services.
              </p>

              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account, browsing the marketplace, making an offer, or purchasing a domain through Rare Domains Marketplace (RDM), you acknowledge that you have read, understood, and agree to be bound by these Terms.
              </p>

              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years old and capable of forming a binding contract to use our Services. By using the Services, you represent and warrant that you meet these eligibility requirements.
              </p>

              <h2>3. Our Services</h2>
              <p>Rare Domains Marketplace (RDM) provides a platform for:</p>
              <ul>
                <li>Browsing and purchasing premium domain names.</li>
                <li>Making offers on listed domain names.</li>
                <li>Facilitating secure transfer of domain ownership.</li>
              </ul>
              <p>
                We act as an intermediary to connect buyers and sellers. We do not own all listed domains directly unless explicitly stated.
              </p>

              <h2>4. Domain Purchase and Transfer</h2>
              <h3>4.1 Pricing and Payments</h3>
              <ul>
                <li>All prices are listed in USD unless otherwise specified.</li>
                <li>Payments are processed securely through third-party payment gateways (e.g., PayPal). You agree to abide by their terms and conditions.</li>
                <li>Rare Domains Marketplace (RDM) is not responsible for any fees charged by third-party payment processors.</li>
              </ul>
              <h3>4.2 Domain Transfer</h3>
              <ul>
                <li>Upon successful payment, we will initiate the domain transfer process to your designated registrar account.</li>
                <li>Buyers are responsible for providing accurate and complete transfer information. Delays due to incorrect information are the buyer's responsibility.</li>
                <li>The transfer process typically takes between 2-7 business days, depending on the domain registrar and transfer type.</li>
                <li>We guarantee transfer assistance, but cannot guarantee immediate transfer due to third-party policies.</li>
              </ul>
              <h3>4.3 Refunds</h3>
              <ul>
                <li>Due to the unique nature of domain names, all sales are generally final.</li>
                <li>Refunds will only be considered if we are unable to successfully transfer the purchased domain to you within a reasonable timeframe (e.g., 30 days) after all necessary information has been provided by the buyer.</li>
                <li>Service fees may be non-refundable.</li>
              </ul>

              <h2>5. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Services for any unlawful purpose.</li>
                <li>Interfere with the security or proper functioning of the Services.</li>
                <li>Attempt to gain unauthorized access to any part of the Services.</li>
                <li>Post false, misleading, or fraudulent information.</li>
              </ul>

              <h2>6. Intellectual Property</h2>
              <p>
                All content on the Rare Domains Marketplace (RDM) website, including text, graphics, logos, and software, is the property of Rare Domains Marketplace (RDM) or its licensors and is protected by intellectual property laws.
              </p>

              <h2>7. Disclaimers and Limitation of Liability</h2>
              <ul>
                <li>Our Services are provided "as is" and "as available" without any warranties.</li>
                <li>Rare Domains Marketplace (RDM) does not guarantee that the Services will be uninterrupted, error-free, or secure.</li>
                <li>In no event shall Rare Domains Marketplace (RDM) be liable for any indirect, incidental, special, consequential, or punitive damages.</li>
              </ul>

              <h2>8. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law principles.
              </p>

              <h2>9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Services after such modifications constitutes your acceptance of the new Terms.
              </p>

              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <ul>
                <li>By email: <a href="mailto:info@rdm.bz">info@rdm.bz</a></li>
                <li>By visiting this page on our website: <Link to="/contact">rdm.bz/contact</Link></li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;