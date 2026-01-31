import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle2, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import ConfirmationMessage from '@/components/ConfirmationMessage';

const MakeOfferForm = ({ domain, onClose }) => {
  const [formData, setFormData] = useState({
    buyer_name: '',
    email: '',
    phone: '',
    offer_amount: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const { toast } = useToast();

  const validateForm = () => {
    if (!formData.buyer_name.trim()) return "Full Name is required.";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "A valid Email Address is required.";
    if (!formData.phone.trim()) return "Phone Number is required.";
    if (!formData.offer_amount || isNaN(parseFloat(formData.offer_amount)) || parseFloat(formData.offer_amount) <= 0) return "A valid Offer Amount is required.";
    if (!formData.message.trim()) return "Message is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    if (!domain?.id) {
      setValidationError("Domain information is missing. Please refresh the page.");
      return;
    }

    setSubmitting(true);

    try {
      const leadData = {
        buyer_name: formData.buyer_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        domain_id: domain.id,
        offer_amount: parseFloat(formData.offer_amount),
        message: formData.message.trim(),
        status: 'new',
      };

      const { error: dbError } = await supabase
        .from('leads')
        .insert([leadData]);

      if (dbError) {
        throw new Error(dbError.message || "Database insertion failed");
      }

      if (window.gtag) {
        window.gtag('event', 'lead_submission', {
          domain_name: domain.name,
          offer_amount: leadData.offer_amount,
        });
      }

      setSubmitted(true);
      toast({
        title: "Offer Submitted!",
        description: "We've received your offer successfully.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900",
      });

      setFormData({
        buyer_name: '',
        email: '',
        phone: '',
        offer_amount: '',
        message: '',
      });

    } catch (err) {
      console.error("Submission Logic Error:", err);
      setValidationError("Failed to submit offer. Please try again.");
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not save your offer. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Make an Offer</h2>
            <p className="text-sm text-slate-500">
              For <span className="font-semibold text-emerald-600">{domain.name}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="py-4">
              <ConfirmationMessage title="Offer Received!">
                <p>
                  Thank you for your offer of <span className="font-bold">${formData.offer_amount}</span> for <span className="font-bold">{domain.name}</span>.
                </p>
              </ConfirmationMessage>
              <div className="mt-6">
                <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  Close Window
                </Button>
              </div>
            </div>
          ) : (
            <>
              {validationError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buyer_name}
                      onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Offer Amount (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400">
                        <DollarSign className="h-5 w-5" />
                      </span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.offer_amount}
                        onChange={(e) => setFormData({ ...formData, offer_amount: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-slate-400"
                        placeholder="5000.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none placeholder:text-slate-400"
                    placeholder="I'm interested in acquiring this domain because..."
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base shadow-lg shadow-emerald-200/50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Offer...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Submit Official Offer
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MakeOfferForm;