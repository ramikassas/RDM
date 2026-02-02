
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import SEOHead from '@/components/SEOHead';
import { usePageSEO } from '@/hooks/usePageSEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { seoData } = usePageSEO('contact');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from('contact_messages')
      .insert([formData]);

    if (error) {
      toast({
        title: 'Error submitting message',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      console.error('Error submitting contact form:', error);
    } else {
      toast({
        title: 'Message sent!',
        description: 'We have received your message and will get back to you soon.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    }
    setIsSubmitting(false);
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "url": "https://rdm.bz/contact",
    "name": "Contact Rare Domains Marketplace (RDM)",
    "description": "Get in touch with the Rare Domains Marketplace (RDM) team for inquiries about premium domains, sales, or support.",
    "publisher": {
      "@type": "Organization",
      "name": "Rare Domains Marketplace (RDM)",
      "url": "https://rdm.bz",
      "logo": "https://rdm.bz/logo.png"
    },
    "mainEntity": {
      "@type": "ContactPoint",
      "telephone": "+905313715417", 
      "contactType": "customer service",
      "email": "info@rdm.bz"
    }
  };

  const pageTitle = seoData?.h1_title || "Get in Touch with RDM";
  const pageHeading = seoData?.page_heading || "Whether you have a question about a domain, need support, or want to make an offer, our team is here to help.";

  return (
    <>
      <SEOHead 
        seoData={seoData}
        defaultTitle="Contact Us | Rare Domains Marketplace (RDM)" 
        defaultDescription="Get in touch with our team. Have questions about premium domains? Contact us for support, inquiries, or partnership opportunities."
        defaultKeywords="contact RDM, rare domains support, premium domain inquiry, RDM customer service"
        schema={contactSchema}
      />

      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Contact Us', path: null }]} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              {pageTitle}
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              {pageHeading}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <MessageSquare className="h-6 w-6 text-emerald-600 mr-3" />
                Reach Out Directly
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We're committed to providing prompt and helpful responses. Fill out the form or use the direct contact methods below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-emerald-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Email Us</h3>
                    <a href="mailto:info@rdm.bz" className="text-slate-600 hover:text-emerald-600 transition-colors">info@rdm.bz</a>
                    <p className="text-sm text-slate-500">Expect a response within 24-48 hours.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-emerald-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Call Us</h3>
                    <a href="tel:+905313715417" className="text-slate-600 hover:text-emerald-600 transition-colors">+90 531 371 5417</a>
                    <p className="text-sm text-slate-500">Available Monday - Friday, 9 AM - 5 PM Turkey - Istanbul.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-emerald-600 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Our Location</h3>
                    <p className="text-slate-600">Global Operations (Remote)</p>
                    <p className="text-sm text-slate-500">Serving clients worldwide.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  ></textarea>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-lg rounded-xl transition-transform active:scale-[0.99]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
