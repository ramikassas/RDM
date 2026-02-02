
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { ShoppingCart, Mail, Calendar, Eye, Phone, FileText, User, DollarSign, Globe, Hash, Check, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, domains(name)')
      .order('created_at', { ascending: false });
      
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setOffers(data || []);
    setLoading(false);
  };

  const convertToOrder = async (offer) => {
    if (!window.confirm(`Create an order for ${offer.buyer_name}?`)) return;

    try {
      const { error } = await supabase.from('orders').insert([{
        domain_id: offer.domain_id,
        buyer_name: offer.buyer_name,
        buyer_email: offer.email,
        price: offer.offer_amount,
        status: 'pending',
        notes: `Converted from offer. Message: ${offer.message || 'N/A'}`
      }]);

      if (error) throw error;
      
      await supabase.from('leads').update({ status: 'accepted' }).eq('id', offer.id);
      
      toast({ title: "Success", description: "Order created from offer." });
      fetchOffers(); 
      if (selectedOffer?.id === offer.id) setSelectedOffer(null);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  return (
    <>
      <SEO title="Offers & Bids | RDM Admin" />
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="max-w-[1200px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Offers & Bids</h1>
                <p className="text-slate-500 mt-1">Review and manage incoming offers for your domains.</p>
             </div>
          </div>

          {/* Modern Table Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Message</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                     <tr><td colSpan="5" className="p-12 text-center text-slate-500">Loading offers...</td></tr>
                  ) : offers.length === 0 ? (
                     <tr><td colSpan="5" className="p-12 text-center text-slate-500">No offers found.</td></tr>
                  ) : (
                    offers.map(offer => (
                    <tr key={offer.id} className="group hover:bg-slate-50 transition-colors h-[70px]">
                      <td className="px-6 py-4 font-semibold text-slate-900">{offer.domains?.name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{offer.buyer_name}</div>
                        <div className="text-xs text-slate-500">{offer.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md border border-emerald-100">
                          ${Number(offer.offer_amount).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm hidden md:table-cell max-w-xs truncate">
                        {offer.message || <span className="text-slate-300 italic">No message</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setSelectedOffer(offer)}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-2" /> View
                          </Button>
                          {offer.status !== 'accepted' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => convertToOrder(offer)}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                            >
                              <Check className="h-4 w-4 mr-2" /> Accept
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Premium Details Modal - Mobile Optimized & Redesigned */}
        <Dialog open={!!selectedOffer} onOpenChange={(open) => !open && setSelectedOffer(null)}>
          <DialogContent className="sm:max-w-[900px] w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 bg-white sm:rounded-2xl overflow-hidden flex flex-col border-0 shadow-2xl">
            
            {selectedOffer && (
              <>
                {/* Mobile Header - Fixed at top */}
                <div className="shrink-0 flex sm:hidden items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
                   <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setSelectedOffer(null)}>
                       <ArrowLeft className="h-6 w-6 text-slate-600" />
                     </Button>
                     <h2 className="font-bold text-lg text-slate-900">Offer Details</h2>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setSelectedOffer(null)}>
                     <X className="h-6 w-6 text-slate-400" />
                   </Button>
                </div>

                {/* Desktop Gradient Bar - Hidden on Mobile */}
                <div className="shrink-0 hidden sm:block h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />
                
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
                  
                  {/* Top Section: Domain & Amount */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1 w-full">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain Asset</label>
                       <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-all">{selectedOffer.domains?.name}</h2>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider md:block">Offered Price</label>
                       <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                          ${Number(selectedOffer.offer_amount).toLocaleString()}
                       </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    
                    {/* Column 1: Status & Date */}
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                          <div>
                             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                selectedOffer.status === 'accepted' 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                             }`}>
                                {selectedOffer.status}
                             </span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Submission Date</label>
                          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-slate-400" />
                             {formatDate(selectedOffer.created_at)}
                          </div>
                       </div>
                    </div>

                    {/* Column 2: Buyer Details */}
                    <div className="space-y-6 md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buyer Name</label>
                            <div className="text-base font-bold text-slate-900">{selectedOffer.buyer_name}</div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                            <div className="text-base font-bold text-slate-900 break-all">{selectedOffer.email}</div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                            <div className="text-base font-bold text-slate-900">{selectedOffer.phone || 'N/A'}</div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Section */}
                  <div className="space-y-3 pt-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buyer Message</label>
                     <div className="bg-slate-50 rounded-xl p-4 sm:p-6 text-slate-700 border border-slate-100 leading-relaxed">
                        {selectedOffer.message ? (
                          <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedOffer.message}</p>
                        ) : (
                          <span className="italic text-slate-400 text-sm">No additional message included with this offer.</span>
                        )}
                     </div>
                  </div>
                  
                  {/* System ID */}
                  <div className="text-[10px] text-slate-300 font-mono uppercase tracking-widest pt-2">
                     ID: {selectedOffer.id}
                  </div>
                </div>

                {/* Footer Actions - Fixed at bottom for mobile */}
                <div className="shrink-0 p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                   <Button 
                     variant="outline" 
                     size="lg"
                     onClick={() => setSelectedOffer(null)} 
                     className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium"
                   >
                     Close Details
                   </Button>
                   {selectedOffer.status !== 'accepted' && (
                     <Button 
                       size="lg"
                       onClick={() => convertToOrder(selectedOffer)} 
                       className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white h-12 sm:h-10 text-base sm:text-sm font-bold shadow-md"
                     >
                       Accept & Create Order
                     </Button>
                   )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminOffers;
