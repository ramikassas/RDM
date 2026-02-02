import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Info, ShieldCheck, Mail, ClipboardCheck, ArrowUpRight, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import SEO from '@/components/SEO';
import Breadcrumbs from '@/components/Breadcrumbs';

const TransferPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [domainName, setDomainName] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Reference for the hidden file input
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const domain = params.get('domain');
    if (domain) {
      setDomainName(domain);
      toast({
        title: "Purchase Successful!",
        description: `You've purchased ${domain}. Please complete the form below to initiate transfer.`,
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
    }
  }, [location.search, toast]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
    }
  };

  const handleTriggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let paymentScreenshotUrl = null;
      
      if (paymentScreenshot) {
        // Sanitize filename and create a unique path
        const fileExt = paymentScreenshot.name.split('.').pop();
        const sanitizedFileName = paymentScreenshot.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${sanitizedFileName}.${fileExt}`;
        // Use a clean path structure - no nested folder with same name as bucket
        const filePath = fileName; 

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment_proofs')
          .upload(filePath, paymentScreenshot, {
            cacheControl: '3600',
            upsert: false,
            onUploadProgress: (event) => {
              if (event.lengthComputable) {
                setUploadProgress(Math.round((event.loaded / event.total) * 100));
              }
            },
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload proof: ${uploadError.message}`);
        }
        
        const { data: urlData } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(filePath);
          
        paymentScreenshotUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('purchase_requests')
        .insert([{
          domain_name: domainName,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone || null,
          payment_receipt_url: null, // Explicitly null to avoid 404s on "N/A"
          payment_screenshot_url: paymentScreenshotUrl,
          status: 'pending_transfer',
          admin_notes: 'New purchase request via transfer form.',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast({
        title: 'Transfer Request Submitted!',
        description: 'We have received your details and will begin the domain transfer process shortly.',
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      
      // Clear form
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setPaymentScreenshot(null);
      setUploadProgress(0);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Error',
        description: error.message || "An unexpected error occurred. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const transferSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Transfer Your Domain from Rare Domains Marketplace (RDM)",
    "description": "A step-by-step guide on the domain transfer process after purchasing a premium domain from Rare Domains Marketplace (RDM).",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Complete Payment",
        "text": "Make the payment for your chosen domain through our secure payment gateway."
      },
      {
        "@type": "HowToStep",
        "name": "Submit Transfer Details",
        "text": "Fill out our transfer request form with your contact information and payment proof."
      },
      {
        "@type": "HowToStep",
        "name": "Provide Registrar Account",
        "text": "Ensure you have an active domain registrar account (e.g., GoDaddy, Namecheap) ready for transfer."
      },
      {
        "@type": "HowToStep",
        "name": "Receive Transfer Authorization Code (EPP)",
        "text": "We will provide you with the necessary EPP/Authorization code for the domain."
      },
      {
        "@type": "HowToStep",
        "name": "Initiate Transfer at Your Registrar",
        "text": "Use the EPP code at your registrar to initiate the inbound transfer."
      },
      {
        "@type": "HowToStep",
        "name": "Confirm Transfer",
        "text": "Confirm the transfer via email and allow 5-7 days for the process to complete."
      }
    ]
  };

  return (
    <>
      <SEO 
        title="Domain Transfer | Rare Domains Marketplace (RDM)" 
        description="Learn about the secure and seamless domain transfer process after acquiring a premium domain from Rare Domains Marketplace (RDM)."
        keywords="domain transfer, RDM transfer guide, premium domain transfer, how to transfer domain, Rare Domains Marketplace"
      />

      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <Breadcrumbs items={[{ label: 'Domain Transfer', path: null }]} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Seamless Domain Transfer
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Congratulations on your new acquisition! Follow these steps to ensure a smooth and secure transfer of your premium domain.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Transfer Steps */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <ClipboardCheck className="h-6 w-6 text-emerald-600 mr-3" />
                Your Transfer Checklist
              </h2>
              <ol className="space-y-6 text-slate-700">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">1. Confirm Your Purchase</h3>
                    <p className="text-base">Ensure your payment for <strong>{domainName || 'your domain'}</strong> has been successfully processed.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">2. Prepare Your Registrar Account</h3>
                    <p className="text-base">
                      Have an active account with your preferred domain registrar (e.g., GoDaddy, Namecheap, Cloudflare). Ensure your account information is up to date.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">3. Submit Your Details Below</h3>
                    <p className="text-base">
                      Complete the form on the right with your contact information and payment proof. This initiates our transfer process.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">4. Receive Authorization Code (EPP)</h3>
                    <p className="text-base">
                      Our team will process your request and email you the necessary EPP/Authorization code within 24-48 hours.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">5. Initiate Transfer at Your Registrar</h3>
                    <p className="text-base">
                      Log in to your registrar account, find the "transfer in" or "transfer a domain" option, and enter the EPP code we provided.
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-4 text-emerald-600">
                    <CheckCircle className="h-6 w-6 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">6. Confirmation & Completion</h3>
                    <p className="text-base">
                      You may receive a confirmation email from your registrar. The entire process typically completes in 5-7 business days.
                    </p>
                  </div>
                </li>
              </ol>

              <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-200 text-blue-800 rounded-lg flex items-start">
                <Info className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  For .WEB3 domains, the transfer process is typically much faster and happens directly through Unstoppable Domains. Our team will guide you.
                </p>
              </div>
            </motion.div>

            {/* Transfer Request Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-slate-100 shadow-lg"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Submit Your Transfer Details</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="domainName" className="block text-sm font-medium text-slate-700 mb-2">
                    Domain Purchased
                  </label>
                  <input
                    type="text"
                    id="domainName"
                    name="domainName"
                    value={domainName}
                    onChange={(e) => setDomainName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    placeholder="e.g., example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="buyerName" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    id="buyerName"
                    name="buyerName"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="buyerEmail" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="buyerEmail"
                    name="buyerEmail"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="buyerPhone" className="block text-sm font-medium text-slate-700 mb-2">
                    Your Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="buyerPhone"
                    name="buyerPhone"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                  />
                </div>
                
                {/* Custom File Upload Input */}
                <div>
                  <label htmlFor="paymentScreenshot" className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Payment Screenshot/Proof
                    <span className="text-slate-500 ml-1 text-xs">(Recommended)</span>
                  </label>
                  
                  {/* Hidden Native Input */}
                  <input
                    type="file"
                    id="paymentScreenshot"
                    name="paymentScreenshot"
                    accept="image/*, .pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Custom Button and Display */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Button
                      type="button"
                      onClick={handleTriggerFileUpload}
                      className="rounded-full bg-emerald-50 text-emerald-700 border-0 hover:bg-emerald-100 font-semibold px-6 py-2 h-auto"
                    >
                      Choose File
                    </Button>
                    
                    <span className="text-sm text-slate-500 truncate max-w-xs">
                      {paymentScreenshot ? paymentScreenshot.name : "No file selected"}
                    </span>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                      <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-lg rounded-xl transition-transform active:scale-[0.99]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-5 w-5 mr-2" />
                      Initiate Transfer
                    </>
                  )}
                </Button>
                <p className="text-xs text-slate-500 text-center mt-4">
                  By submitting this form, you agree to the <Link to="/terms" className="text-emerald-600 hover:underline">Terms of Service</Link>.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferPage;