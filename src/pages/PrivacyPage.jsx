import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const PrivacyPage = () => {
  const privacySchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy - Rare Domains Marketplace (RDM)",
    "description": "Read the Privacy Policy for Rare Domains Marketplace (RDM) to understand how we collect, use, and protect your personal information.",
    "url": "https://rdm.bz/privacy",
    "publisher": {
      "@type": "Organization",
      "name": "Rare Domains Marketplace (RDM)",
      "url": "https://rdm.bz"
    }
  };

  return (
    <>
      <SEO 
        title="Privacy Policy | Rare Domains Marketplace (RDM)" 
        description="Our privacy policy. Learn how we protect your data and personal information on our premium domain marketplace platform."
        keywords="privacy policy, data protection, RDM privacy, personal information, Rare Domains Marketplace"
        schema={privacySchema}
      />

      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Privacy Policy', path: null }]} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-lg p-8 md:p-12 border border-slate-100"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 text-center">
              Privacy Policy
            </h1>
            <p className="text-center text-slate-600 mb-10 text-lg">
              Last updated: <time dateTime="2025-12-01">December 01, 2025</time>
            </p>

            <div className="prose prose-lg max-w-none text-slate-700">
              <p>
                Welcome to Rare Domains Marketplace (RDM). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at rdm.bz and use our services.
              </p>

              <h2>1. Information We Collect</h2>
              <p>
                We collect various types of information in connection with the services we provide, including:
              </p>
              <h3>1.1 Personal Data</h3>
              <ul>
                <li><strong>Contact Information:</strong> Name, email address, phone number, and postal address.</li>
                <li><strong>Transaction Data:</strong> Details about domain purchases, offers, and payment information (processed by secure third-party providers like PayPal).</li>
                <li><strong>Communication Data:</strong> Records of your correspondence with us, such as inquiries through our contact form.</li>
              </ul>
              <h3>1.2 Usage Data</h3>
              <ul>
                <li><strong>Browsing Information:</strong> IP address, browser type, operating system, referral URLs, pages visited, and time spent on pages.</li>
                <li><strong>Cookies and Tracking Technologies:</strong> Information collected through cookies, web beacons, and similar technologies to enhance user experience and analyze site performance.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul>
                <li><strong>To Provide and Maintain Our Service:</strong> Including processing transactions, managing your account, and providing customer support.</li>
                <li><strong>To Improve Our Website:</strong> Understanding how users interact with our platform to enhance functionality and user experience.</li>
                <li><strong>To Communicate With You:</strong> Sending transaction confirmations, responding to inquiries, and sending updates about our services.</li>
                <li><strong>For Marketing and Promotional Purposes:</strong> With your consent, we may use your information to send you promotional materials.</li>
                <li><strong>For Security:</strong> Detecting and preventing fraud, unauthorized access, and other malicious activities.</li>
              </ul>

              <h2>3. Disclosure of Your Information</h2>
              <p>We may share your information in the following situations:</p>
              <ul>
                <li><strong>With Service Providers:</strong> Third-party vendors who perform services on our behalf, such as payment processing (e.g., PayPal), hosting, and analytics.</li>
                <li><strong>For Business Transfers:</strong> In connection with a merger, sale of company assets, financing, or acquisition of all or a portion of our business.</li>
                <li><strong>For Legal Reasons:</strong> If required by law or in response to valid requests by public authorities (e.g., a court or government agency).</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your explicit consent.</li>
              </ul>

              <h2>4. Data Security</h2>
              <p>
                We implement reasonable technical and organizational measures designed to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>

              <h2>5. Your Data Protection Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your personal data:</p>
              <ul>
                <li><strong>Access:</strong> The right to request copies of your personal data.</li>
                <li><strong>Rectification:</strong> The right to request that we correct any information you believe is inaccurate or complete incomplete information.</li>
                <li><strong>Erasure:</strong> The right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>Restrict Processing:</strong> The right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li><strong>Object to Processing:</strong> The right to object to our processing of your personal data, under certain conditions.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at info@rdm.bz.
              </p>

              <h2>6. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
              </p>

              <h2>7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We advise you to review this Privacy Policy periodically for any changes.
              </p>

              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPage;