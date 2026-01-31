import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams, useLocation } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, Save, X, CheckCircle, AlertCircle, Search, Loader2, 
  DollarSign, ShoppingCart, MessageSquare, 
  Image as ImageIcon, Mail, Phone, Calendar, ArrowUpRight, Filter, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AdminNav from '@/components/AdminNav';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// --- UTILITIES ---
const safeJoin = (arr) => Array.isArray(arr) ? arr.join(', ') : '';
const safeSplit = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str;
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
};
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // Determine current view
  const tabParam = searchParams.get('tab');
  const isInventoryPath = location.pathname === '/0955';
  const currentView = isInventoryPath ? 'inventory' : (tabParam || 'sales');

  // --- STATE ---
  const [domains, setDomains] = useState([]);
  const [sales, setSales] = useState([]);
  const [offers, setOffers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form & Modal States
  const [isSaving, setIsSaving] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  
  // Detail Modal States
  const [detailItem, setDetailItem] = useState(null);
  const [detailType, setDetailType] = useState(null); // 'sale', 'offer', 'message'

  const emptyDomain = {
    name: '', price: '', category: '', description: '', tagline: '',
    use_cases: '', usp_points: '', market_rationale: '', similar_domains: '',
    status: 'available', tld: '.com', featured: false,
  };
  const [domainFormData, setDomainFormData] = useState(emptyDomain);

  // --- EFFECTS ---
  useEffect(() => {
    if (user) fetchData();
  }, [user, currentView]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (currentView === 'inventory') await fetchDomains();
      else if (currentView === 'sales') await fetchSales();
      else if (currentView === 'offers') await fetchOffers();
      else if (currentView === 'messages') await fetchMessages();
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ variant: "destructive", title: "Error loading data", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDomains = async () => {
    const { data, error } = await supabase.from('domains').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setDomains(data || []);
  };
  const fetchSales = async () => {
    const { data, error } = await supabase.from('purchase_requests').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setSales(data || []);
  };
  const fetchOffers = async () => {
    const { data, error } = await supabase.from('leads').select(`*, domains:domain_id (name)`).order('created_at', { ascending: false });
    if (error) throw error;
    setOffers(data || []);
  };
  const fetchMessages = async () => {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    setMessages(data || []);
  };

  // --- HANDLERS ---
  const handleInputChange = (field, value) => setDomainFormData(prev => ({ ...prev, [field]: value }));
  
  const handleEditClick = (domain) => {
    setEditingDomain(domain); setShowAddForm(true);
    setDomainFormData({
      name: domain.name || '', price: domain.price ? domain.price.toString() : '',
      category: domain.category || '', description: domain.description || '',
      tagline: domain.tagline || '', market_rationale: domain.market_rationale || '',
      status: domain.status || 'available', tld: domain.tld || '.com', featured: !!domain.featured,
      use_cases: safeJoin(domain.use_cases), usp_points: safeJoin(domain.usp_points),
      similar_domains: safeJoin(domain.similar_domains),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewClick = () => { setEditingDomain(null); setDomainFormData(emptyDomain); setShowAddForm(true); };
  const handleCancel = () => { setShowAddForm(false); setEditingDomain(null); setDomainFormData(emptyDomain); };

  const handleDomainSave = async () => {
    if (!domainFormData.name?.trim()) return toast({ variant: "destructive", title: "Error", description: "Domain Name is required." });
    setIsSaving(true);
    try {
      const payload = {
        ...domainFormData,
        price: parseFloat(domainFormData.price) || 0,
        use_cases: safeSplit(domainFormData.use_cases),
        usp_points: safeSplit(domainFormData.usp_points),
        similar_domains: safeSplit(domainFormData.similar_domains),
        updated_at: new Date().toISOString(),
      };
      const { error } = editingDomain?.id 
        ? await supabase.from('domains').update(payload).eq('id', editingDomain.id)
        : await supabase.from('domains').insert([payload]);
      if (error) throw error;
      toast({ title: "Success", description: "Inventory updated.", className: "bg-emerald-50 text-emerald-800 border-emerald-200" });
      fetchDomains(); handleCancel();
    } catch (error) { toast({ variant: "destructive", title: "Save Failed", description: error.message }); } finally { setIsSaving(false); }
  };

  const handleDomainDelete = async (id) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (!error) { toast({ title: "Deleted", description: "Domain removed from inventory." }); fetchDomains(); }
  };

  const updateStatus = async (table, id, newStatus, refreshFn) => {
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (!error) { toast({ title: "Updated", description: "Status changed successfully." }); refreshFn(); }
    else toast({ variant: "destructive", title: "Error", description: error.message });
  };

  const filteredDomains = domains.filter(d => d.name.toLowerCase().includes(filterQuery.toLowerCase()));

  // --- RENDER HELPERS ---
  const StatusBadge = ({ status, type = 'default' }) => {
    const styles = {
      available: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      sold: 'bg-slate-100 text-slate-600 border-slate-200',
      reserved: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
      pending: 'bg-blue-50 text-blue-700 border-blue-200',
      new: 'bg-blue-50 text-blue-700 border-blue-200',
      read: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const defaultStyle = 'bg-slate-100 text-slate-600 border-slate-200';
    const key = status?.toLowerCase() || 'default';
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide ${styles[key] || defaultStyle}`}>
        {status}
      </span>
    );
  };

  if (!user) return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">Access Restricted</div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Helmet><title>Admin Dashboard | RDM</title></Helmet>
      
      {/* SIDEBAR NAVIGATION */}
      <AdminNav />
      
      {/* MAIN CONTENT */}
      {/* Removed md:ml-72 as the sidebar is now sticky in the flex container. Added pt-16 on mobile to account for the double header. */}
      <main className="flex-1 p-4 md:p-8 transition-all mt-16 pt-16 md:mt-0 md:pt-8 w-full">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {currentView === 'inventory' && 'Inventory Management'}
                {currentView === 'sales' && 'Sales & Transactions'}
                {currentView === 'offers' && 'Offers & Bids'}
                {currentView === 'messages' && 'Inquiries & Messages'}
              </h1>
              <p className="text-slate-500 mt-1">
                {currentView === 'inventory' && 'Manage your domain portfolio and pricing.'}
                {currentView === 'sales' && 'Track purchase requests and verified sales.'}
                {currentView === 'offers' && 'Review and respond to incoming offers.'}
                {currentView === 'messages' && 'View contact form submissions.'}
              </p>
            </div>
            
            {currentView === 'inventory' && !showAddForm && (
              <Button onClick={handleAddNewClick} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform active:scale-95">
                <Plus className="mr-2 h-4 w-4" /> Add New Domain
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            
            {/* === INVENTORY === */}
            {currentView === 'inventory' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="inventory">
                {showAddForm ? (
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 text-lg">{editingDomain ? 'Edit Domain' : 'Add New Domain'}</h3>
                      <button onClick={handleCancel} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5 text-slate-400" /></button>
                    </div>
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Core Information</h4></div>
                      <div><label className="text-sm font-semibold text-slate-700 mb-1.5 block">Domain Name</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="example.com" value={domainFormData.name} onChange={e => handleInputChange('name', e.target.value)} /></div>
                      <div><label className="text-sm font-semibold text-slate-700 mb-1.5 block">Price (USD)</label><div className="relative"><span className="absolute left-3 top-3 text-slate-400">$</span><input type="number" className="w-full p-3 pl-7 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="5000" value={domainFormData.price} onChange={e => handleInputChange('price', e.target.value)} /></div></div>
                      <div><label className="text-sm font-semibold text-slate-700 mb-1.5 block">Status</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={domainFormData.status} onChange={e => handleInputChange('status', e.target.value)}><option value="available">Available</option><option value="sold">Sold</option><option value="reserved">Reserved</option></select></div>
                      <div><label className="text-sm font-semibold text-slate-700 mb-1.5 block">Category</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="e.g. Tech" value={domainFormData.category} onChange={e => handleInputChange('category', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="text-sm font-semibold text-slate-700 mb-1.5 block">Description</label><textarea rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none" placeholder="Domain description..." value={domainFormData.description} onChange={e => handleInputChange('description', e.target.value)} /></div>
                      
                      <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100">
                         <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                         <Button onClick={handleDomainSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-3 bg-slate-50/50 items-center">
                      <Search className="w-4 h-4 text-slate-400" />
                      <input placeholder="Search inventory..." value={filterQuery} onChange={e => setFilterQuery(e.target.value)} className="bg-transparent outline-none w-full text-sm" />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr><th className="px-6 py-4">Domain Asset</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDomains.map(d => (
                            <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4"><div className="font-bold text-slate-900 text-base">{d.name}</div><div className="text-xs text-slate-500 font-mono mt-0.5">{d.tld} • {d.category || 'Uncategorized'}</div></td>
                              <td className="px-6 py-4 font-bold text-emerald-700">${Number(d.price).toLocaleString()}</td>
                              <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
                              <td className="px-6 py-4 text-right space-x-2">
                                <Button size="sm" variant="ghost" onClick={() => handleEditClick(d)} className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDomainDelete(d.id)} className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                              </td>
                            </tr>
                          ))}
                          {filteredDomains.length === 0 && !isLoading && <tr><td colSpan="4" className="p-12 text-center text-slate-400">No domains found matching your search.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* === SALES / TRANSACTIONS === */}
            {currentView === 'sales' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="sales" className="space-y-4">
                {sales.map(sale => (
                  <div key={sale.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-slate-100 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{sale.domain_name}</h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" /> {formatDate(sale.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={sale.status || 'pending'} />
                        <select 
                          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none hover:border-emerald-400 focus:border-emerald-500 transition-colors cursor-pointer font-medium text-slate-600"
                          value={sale.status || 'pending_transfer'}
                          onChange={(e) => updateStatus('purchase_requests', sale.id, e.target.value, fetchSales)}
                        >
                          <option value="pending_transfer">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buyer Information</h4>
                        <div className="space-y-2">
                          <p className="font-semibold text-slate-900">{sale.buyer_name}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-400" /> {sale.buyer_email}</p>
                          <p className="text-sm text-slate-600 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {sale.buyer_phone}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Verification</h4>
                         {sale.payment_screenshot_url ? (
                            <a href={sale.payment_screenshot_url} target="_blank" rel="noreferrer" className="group block border border-slate-200 rounded-lg p-3 hover:border-emerald-400 transition-colors bg-slate-50 hover:bg-white">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center"><ImageIcon className="w-5 h-5" /></div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700">View Proof</p>
                                  <p className="text-xs text-slate-500">Click to open image</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
                              </div>
                            </a>
                         ) : <p className="text-sm text-slate-400 italic">No payment proof uploaded yet.</p>}
                      </div>

                      <div className="space-y-3">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Notes</h4>
                         <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[80px]">
                            {sale.admin_notes || "No notes added."}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                {sales.length === 0 && !isLoading && <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">No sales records found.</div>}
              </motion.div>
            )}

            {/* === OFFERS & BIDS === */}
            {currentView === 'offers' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="offers" className="grid grid-cols-1 gap-4">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-slate-900">{offer.domains?.name || 'Unknown Domain'}</h3>
                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded border border-emerald-100 flex items-center">
                              <DollarSign className="w-3 h-3 mr-0.5" />{Number(offer.offer_amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                             <span className="font-medium text-slate-700">{offer.buyer_name}</span>
                             <span>&bull;</span>
                             <span>{offer.email}</span>
                             {offer.phone && <><span>&bull;</span><span>{offer.phone}</span></>}
                             <span>&bull;</span>
                             <span>{formatDate(offer.created_at)}</span>
                          </div>
                       </div>
                       <select 
                          className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none hover:border-emerald-400 focus:border-emerald-500 transition-colors cursor-pointer font-medium text-slate-600"
                          value={offer.status || 'new'}
                          onChange={(e) => updateStatus('leads', offer.id, e.target.value, fetchOffers)}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Message Content</h4>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {offer.message || <span className="italic text-slate-400">No message included with this offer.</span>}
                      </p>
                    </div>
                  </div>
                ))}
                {offers.length === 0 && !isLoading && <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">No active offers.</div>}
              </motion.div>
            )}

            {/* === INQUIRIES === */}
            {currentView === 'messages' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key="messages" className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{msg.subject}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                           <span className="font-medium text-slate-700">{msg.name}</span>
                           <span className="text-emerald-600 font-medium bg-emerald-50 px-1.5 rounded">{msg.email}</span>
                           <span>{formatDate(msg.created_at)}</span>
                        </div>
                      </div>
                      <StatusBadge status={msg.status || 'new'} />
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-normal">
                        {msg.message}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <select 
                          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 outline-none hover:border-emerald-400 focus:border-emerald-500 transition-colors cursor-pointer text-slate-600"
                          value={msg.status || 'new'}
                          onChange={(e) => updateStatus('contact_messages', msg.id, e.target.value, fetchMessages)}
                        >
                          <option value="new">Mark as New</option>
                          <option value="read">Mark as Read</option>
                          <option value="replied">Mark as Replied</option>
                        </select>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && !isLoading && <div className="p-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">No messages received.</div>}
              </motion.div>
            )}

          </AnimatePresence>
          
          {isLoading && (
            <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;