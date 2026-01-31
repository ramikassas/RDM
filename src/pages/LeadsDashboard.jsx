import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { Download, Filter, MessageSquare, DollarSign, Mail, Phone, User, FileCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminNav from '@/components/AdminNav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const LeadsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'offers';

  const [leads, setLeads] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null); 
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLeads();
      fetchContactMessages();
      fetchPurchaseRequests();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [leads, statusFilter]);

  const handleTabChange = (value) => {
    setSearchParams({ tab: value });
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        domains (name)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeads(data);
    } else if (error) {
      console.error("Error fetching leads:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch leads." });
    }
  };

  const fetchContactMessages = async () => {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContactMessages(data);
    } else if (error) {
      console.error("Error fetching contact messages:", error);
    }
  };

  const fetchPurchaseRequests = async () => {
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPurchaseRequests(data);
    } else if (error) {
      console.error("Error fetching purchase requests:", error);
    }
  };

  const applyFilters = () => {
    if (statusFilter === 'all') {
      setFilteredLeads(leads);
    } else {
      setFilteredLeads(leads.filter(lead => lead.status === statusFilter));
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (!error) {
      toast({ title: "Status Updated", description: "Lead status has been updated successfully." });
      setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const handlePurchaseStatusUpdate = async (id, newStatus, notes) => {
    const { error } = await supabase
      .from('purchase_requests')
      .update({ status: newStatus, admin_notes: notes })
      .eq('id', id);

    if (!error) {
      toast({ title: "Request Updated", description: "Purchase request has been updated." });
      setPurchaseRequests(prev => prev.map(p => p.id === id ? { ...p, status: newStatus, admin_notes: notes } : p));
      setIsPurchaseModalOpen(false);
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }
  };

  const openMessageModal = (item, type) => {
    setSelectedMessage({ ...item, type });
    setIsMessageModalOpen(true);
  };

  const openPurchaseModal = (item) => {
    setSelectedPurchase({ ...item, newNotes: item.admin_notes || '' });
    setIsPurchaseModalOpen(true);
  };

  const exportLeads = () => {
    if (filteredLeads.length === 0) {
      toast({ variant: "destructive", title: "Export Failed", description: "No leads to export." });
      return;
    }
    const csvHeader = ['Name', 'Email', 'Phone', 'Domain', 'Offer Amount', 'Status', 'Message', 'Date'].join(',');
    const csvRows = filteredLeads.map(lead => [
        `"${lead.buyer_name || ''}"`,
        `"${lead.email || ''}"`,
        `"${lead.phone || ''}"`,
        `"${lead.domains?.name || 'N/A'}"`,
        lead.offer_amount || '',
        `"${lead.status || ''}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`,
        `"${new Date(lead.created_at).toISOString()}"`
    ].join(','));
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: "Export Successful", description: "Leads have been exported to CSV." });
  };
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600">Please sign in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const inputClass = "bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const LeadsTable = ({ data }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Domain / Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-bold text-slate-900">{lead.buyer_name}</span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Mail className="h-3 w-3 mr-1" /> {lead.email}
                    </span>
                    {lead.phone && (
                      <span className="flex items-center text-xs text-slate-500">
                        <Phone className="h-3 w-3 mr-1" /> {lead.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                     <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded w-fit">
                       {lead.domains?.name || 'Unknown Domain'}
                     </span>
                     <div className="flex items-center text-emerald-600 font-bold text-sm">
                       <DollarSign className="h-4 w-4 mr-1" />
                       {lead.offer_amount ? lead.offer_amount.toLocaleString() : '0'}
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={`
                      text-xs font-bold uppercase tracking-wide rounded-md px-3 py-1.5 border outline-none cursor-pointer transition-colors
                      ${lead.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' : ''}
                      ${lead.status === 'in_discussion' ? 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500' : ''}
                      ${lead.status === 'offered' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' : ''}
                      ${lead.status === 'closed_sold' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500' : ''}
                      ${lead.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 focus:ring-red-500' : ''}
                    `}
                  >
                    <option value="new">New Offer</option>
                    <option value="in_discussion">In Discussion</option>
                    <option value="offered">Formal Offer Sent</option>
                    <option value="closed_sold">Sold / Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(lead.created_at).toLocaleDateString()}
                  <div className="text-xs text-slate-400">{new Date(lead.created_at).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  {lead.message ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openMessageModal(lead, 'lead')}
                      className="text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  ) : (
                     <span className="text-slate-300 text-xs italic">No msg</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {data.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                <Filter className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No offers found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or check back later.</p>
            </div>
          )}
      </div>
    </div>
  );

  const ContactMessagesTable = ({ data }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((msg) => (
              <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-bold text-slate-900">{msg.name}</span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Mail className="h-3 w-3 mr-1" /> {msg.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{msg.subject}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(msg.created_at).toLocaleDateString()}
                  <div className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleTimeString()}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openMessageModal(msg, 'contact')}
                    className="text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
           <div className="p-12 text-center">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
               <MessageSquare className="h-6 w-6 text-slate-400" />
             </div>
             <h3 className="text-lg font-medium text-slate-900">No messages found</h3>
           </div>
         )}
      </div>
    </div>
  );

  const PurchaseRequestsTable = ({ data }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Domain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {data.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="text-sm font-bold text-slate-900">{req.buyer_name}</span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Mail className="h-3 w-3 mr-1" /> {req.buyer_email}
                    </span>
                    <span className="flex items-center text-xs text-slate-500">
                      <Phone className="h-3 w-3 mr-1" /> {req.buyer_phone}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded w-fit">
                    {req.domain_name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wide
                    ${req.status === 'verified' ? 'bg-green-100 text-green-700' : 
                      req.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'}
                  `}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(req.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPurchaseModal(req)}
                    className="text-slate-600 hover:text-emerald-600"
                  >
                    <Eye className="h-4 w-4 mr-1" /> Review
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
           <div className="p-12 text-center">
             <h3 className="text-lg font-medium text-slate-900">No purchase requests</h3>
           </div>
         )}
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Inbox & Sales | RDM.bz Admin</title>
        <meta name="description" content="Manage offers, messages, and sales transactions." />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 pb-20 overflow-hidden">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Activity Hub</h1>
                <p className="text-slate-500 mt-1">Monitor inquiries and track sales performance.</p>
            </div>
            <Button onClick={exportLeads} variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>

          <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-8 w-full justify-start bg-white p-1 shadow-sm border border-slate-100 rounded-xl h-auto">
              <TabsTrigger value="offers" className="flex-1 md:flex-none px-6 py-3 text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-lg transition-all">Offers / Bids</TabsTrigger>
              <TabsTrigger value="messages" className="flex-1 md:flex-none px-6 py-3 text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-lg transition-all">Messages / Inquiries</TabsTrigger>
              <TabsTrigger value="sales" className="flex-1 md:flex-none px-6 py-3 text-sm data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-lg transition-all">Sales / Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="offers" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-slate-200 flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-700">Filter Status:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`${inputClass} px-4 py-2 min-w-[200px]`}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="in_discussion">In Discussion</option>
                  <option value="offered">Offered</option>
                  <option value="closed_sold">Closed/Sold</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div className="ml-auto text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                  {filteredLeads.length} Offers Found
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-4 text-blue-800 text-sm flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Viewing submissions from "Make an Offer" forms.
              </div>
              <LeadsTable data={filteredLeads} />
            </TabsContent>

            <TabsContent value="messages" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-4 text-indigo-800 text-sm flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Viewing general inquiries from "Contact Us" page.
              </div>
              <ContactMessagesTable data={contactMessages} />
            </TabsContent>

            <TabsContent value="sales" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg mb-4 text-emerald-800 text-sm flex items-center">
                <FileCheck className="h-4 w-4 mr-2" />
                Viewing pending payment verifications.
              </div>
              <PurchaseRequestsTable data={purchaseRequests} />
            </TabsContent>
          </Tabs>

          {/* Message Detail Modal */}
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {selectedMessage?.type === 'lead' ? (
                      <>
                          <DollarSign className="h-5 w-5 text-emerald-600" />
                          Offer Details
                      </>
                  ) : (
                      <>
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                          Message Details
                      </>
                  )}
                </DialogTitle>
                <DialogDescription className="text-slate-500">
                  Received on {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              {selectedMessage && (
                <div className="space-y-4 mt-4">
                  {/* Sender Info Section */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                      <div className="flex items-start gap-3">
                          <User className="h-4 w-4 text-slate-400 mt-1" />
                          <div>
                              <p className="text-xs font-medium text-slate-500 uppercase">Sender</p>
                              <p className="text-sm font-semibold text-slate-900">
                                  {selectedMessage.type === 'lead' ? selectedMessage.buyer_name : selectedMessage.name}
                              </p>
                          </div>
                      </div>
                      <div className="flex items-start gap-3">
                          <Mail className="h-4 w-4 text-slate-400 mt-1" />
                          <div>
                              <p className="text-xs font-medium text-slate-500 uppercase">Email</p>
                              <a href={`mailto:${selectedMessage.email}`} className="text-sm text-emerald-600 hover:underline break-all">
                                  {selectedMessage.email}
                              </a>
                          </div>
                      </div>
                      {selectedMessage.phone && (
                          <div className="flex items-start gap-3">
                              <Phone className="h-4 w-4 text-slate-400 mt-1" />
                              <div>
                                  <p className="text-xs font-medium text-slate-500 uppercase">Phone</p>
                                  <a href={`tel:${selectedMessage.phone}`} className="text-sm text-slate-700 hover:text-slate-900">
                                      {selectedMessage.phone}
                                  </a>
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Specific Details based on Type */}
                  <div className="grid grid-cols-2 gap-4">
                      {selectedMessage.type === 'lead' && (
                          <>
                              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                  <p className="text-xs font-medium text-emerald-700 uppercase mb-1">Offer Amount</p>
                                  <p className="text-lg font-bold text-emerald-900">
                                      ${selectedMessage.offer_amount?.toLocaleString()}
                                  </p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <p className="text-xs font-medium text-slate-500 uppercase mb-1">Domain</p>
                                  <p className="text-sm font-bold text-slate-900">
                                      {selectedMessage.domains?.name || 'Unknown'}
                                  </p>
                              </div>
                          </>
                      )}
                      {selectedMessage.type === 'contact' && (
                          <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <p className="text-xs font-medium text-slate-500 uppercase mb-1">Subject</p>
                              <p className="text-sm font-bold text-slate-900">
                                  {selectedMessage.subject}
                              </p>
                          </div>
                      )}
                  </div>

                  {/* Message Body */}
                  <div className="pt-2">
                      <p className="text-xs font-medium text-slate-500 uppercase mb-2">Message Content</p>
                      <div className="bg-white p-4 rounded-lg border border-slate-200 text-slate-700 text-sm whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {selectedMessage.message || "No message content provided."}
                      </div>
                  </div>
                </div>
              )}

              <DialogFooter className="sm:justify-end mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsMessageModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Purchase Verification Modal */}
          <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
            <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  Verify Purchase Request
                </DialogTitle>
                <DialogDescription>
                  For domain: <span className="font-bold text-slate-900">{selectedPurchase?.domain_name}</span>
                </DialogDescription>
              </DialogHeader>

              {selectedPurchase && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                        <h4 className="font-bold text-slate-900 text-sm border-b pb-2">Buyer Details</h4>
                        <p className="text-sm"><span className="text-slate-500">Name:</span> {selectedPurchase.buyer_name}</p>
                        <p className="text-sm"><span className="text-slate-500">Email:</span> {selectedPurchase.buyer_email}</p>
                        <p className="text-sm"><span className="text-slate-500">Phone:</span> {selectedPurchase.buyer_phone}</p>
                        <p className="text-sm"><span className="text-slate-500">Submitted:</span> {new Date(selectedPurchase.created_at).toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Admin Notes</label>
                        <textarea 
                          className="w-full border rounded-md p-2 text-sm h-24"
                          placeholder="Add notes about this transaction..."
                          value={selectedPurchase.newNotes}
                          onChange={(e) => setSelectedPurchase(prev => ({ ...prev, newNotes: e.target.value }))}
                        />
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handlePurchaseStatusUpdate(selectedPurchase.id, 'verified', selectedPurchase.newNotes)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Verify & Accept
                        </Button>
                        <Button 
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handlePurchaseStatusUpdate(selectedPurchase.id, 'rejected', selectedPurchase.newNotes)}
                        >
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 text-sm">Payment Proofs</h4>
                      <div className="grid gap-4">
                        <div className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Official Receipt</p>
                          <a href={selectedPurchase.payment_receipt_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                              <div className="bg-slate-200 h-32 rounded flex items-center justify-center text-slate-500 text-sm group-hover:bg-slate-300">
                                Click to View Receipt
                              </div>
                          </a>
                        </div>
                        <div className="border rounded-lg p-3 hover:bg-slate-50 transition-colors">
                          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Screenshot</p>
                          <a href={selectedPurchase.payment_screenshot_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                              <div className="bg-slate-200 h-32 rounded flex items-center justify-center text-slate-500 text-sm group-hover:bg-slate-300">
                                Click to View Screenshot
                              </div>
                          </a>
                        </div>
                      </div>
                    </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
};

export default LeadsDashboard;