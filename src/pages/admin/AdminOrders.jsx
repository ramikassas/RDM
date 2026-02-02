
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Eye, Trash2, ShoppingCart, DollarSign, User, Calendar, FileText, Check, X, ArrowLeft, Clock, Search, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // For viewing details
  
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    domain_id: '',
    buyer_name: '',
    buyer_email: '',
    price: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchOrders();
    fetchDomains();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*, domains(name)')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const fetchDomains = async () => {
    const { data } = await supabase.from('domains').select('id, name');
    if (data) setDomains(data);
  };

  const handleSave = async () => {
    try {
      const payload = { ...formData };
      let error;
      if (editingId) {
        const { error: err } = await supabase.from('orders').update(payload).eq('id', editingId);
        error = err;
      } else {
        const { error: err } = await supabase.from('orders').insert([payload]);
        error = err;
      }
      if (error) throw error;
      toast({ title: "Success", description: "Order saved successfully." });
      setIsEditModalOpen(false);
      fetchOrders();
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (!error) {
      toast({ title: "Deleted", description: "Order removed permanently." });
      setOrders(prev => prev.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const openEditModal = (order = null, e) => {
    if (e) e.stopPropagation();
    if (order) {
      setEditingId(order.id);
      setFormData({
        domain_id: order.domain_id || '',
        buyer_name: order.buyer_name || '',
        buyer_email: order.buyer_email || '',
        price: order.price || '',
        status: order.status || 'pending',
        notes: order.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({ domain_id: '', buyer_name: '', buyer_email: '', price: '', status: 'pending', notes: '' });
    }
    setIsEditModalOpen(true);
  };

  const filteredOrders = orders.filter(o => 
    o.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.buyer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.domains?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.includes(searchTerm)
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <>
      <SEO title="Orders Management | RDM Admin" />
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="max-w-[1200px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Orders</h1>
              <p className="text-slate-500 mt-1">Track sales, manage transactions, and fulfillment.</p>
            </div>
             <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search orders..." 
                  className="pl-9 bg-white border-slate-200 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => openEditModal()} className="bg-slate-900 hover:bg-slate-800 text-white shrink-0">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">New Order</span>
              </Button>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px]">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="7" className="p-12 text-center text-slate-500">Loading orders...</td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan="7" className="p-12 text-center text-slate-500">No orders found matching your criteria.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        className="group transition-all duration-200 hover:bg-slate-50 cursor-pointer h-[60px]"
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-400">#{order.id.slice(0,8)}</span>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-slate-900">{order.domains?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-6 py-3">
                           <div className="flex flex-col justify-center">
                            <span className="text-sm font-medium text-slate-900">{order.buyer_name}</span>
                            <span className="text-xs text-slate-500 truncate max-w-[150px]">{order.buyer_email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                           <div className="font-bold text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md border border-emerald-100 text-sm">
                             ${Number(order.price).toLocaleString()}
                           </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(order.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                              onClick={(e) => openEditModal(order, e)}
                              title="Edit Order"
                            >
                               <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => handleDelete(order.id, e)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No orders found.</div>
              ) : (
                filteredOrders.map((order) => (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-4 active:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{order.domains?.name || 'Unknown Domain'}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">ID: #{order.id.slice(0,8)}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-end mt-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{order.buyer_name}</p>
                        <p className="text-xs text-slate-500">{order.buyer_email}</p>
                      </div>
                      <div className="text-lg font-black text-emerald-600">
                        ${Number(order.price).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* View Order Details Modal - Premium Design */}
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="sm:max-w-[900px] w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 bg-white sm:rounded-2xl overflow-hidden flex flex-col border-0 shadow-2xl">
             
             {selectedOrder && (
              <>
                {/* Mobile Header */}
                <div className="shrink-0 flex sm:hidden items-center justify-between p-4 border-b border-slate-100 bg-white z-10">
                   <div className="flex items-center gap-3">
                     <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setSelectedOrder(null)}>
                       <ArrowLeft className="h-6 w-6 text-slate-600" />
                     </Button>
                     <h2 className="font-bold text-lg text-slate-900">Order Details</h2>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)}>
                     <X className="h-6 w-6 text-slate-400" />
                   </Button>
                </div>

                {/* Desktop Gradient Bar */}
                <div className="shrink-0 hidden sm:block h-2 bg-gradient-to-r from-emerald-500 to-teal-500 w-full" />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
                  
                  {/* Top Section: Domain & Amount */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1 w-full">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Domain Asset</label>
                       <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight break-all">{selectedOrder.domains?.name}</h2>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                       <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider md:block">Sale Price</label>
                       <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                          ${Number(selectedOrder.price).toLocaleString()}
                       </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    
                    {/* Column 1: Status & Date */}
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Order Status</label>
                          <div>
                             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status}
                             </span>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date Created</label>
                          <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                             <Calendar className="w-4 h-4 text-slate-400" />
                             {formatDate(selectedOrder.created_at)}
                          </div>
                       </div>
                    </div>

                    {/* Column 2: Buyer Details */}
                    <div className="space-y-6 md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buyer Name</label>
                            <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-slate-400" />
                              {selectedOrder.buyer_name}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Buyer Email</label>
                            <div className="text-base font-bold text-slate-900 break-all flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              {selectedOrder.buyer_email}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="space-y-3 pt-2">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Internal Notes / Message</label>
                     <div className="bg-slate-50 rounded-xl p-4 sm:p-6 text-slate-700 border border-slate-100 leading-relaxed">
                        {selectedOrder.notes ? (
                          <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedOrder.notes}</p>
                        ) : (
                          <span className="italic text-slate-400 text-sm">No notes available for this order.</span>
                        )}
                     </div>
                  </div>
                  
                  {/* System ID */}
                  <div className="text-[10px] text-slate-300 font-mono uppercase tracking-widest pt-2">
                     Order ID: {selectedOrder.id}
                  </div>
                </div>

                 {/* Footer Actions */}
                <div className="shrink-0 p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
                   <Button 
                     variant="outline" 
                     size="lg"
                     onClick={() => setSelectedOrder(null)} 
                     className="w-full sm:w-auto h-12 sm:h-10 text-base sm:text-sm font-medium"
                   >
                     Close
                   </Button>
                   <Button 
                     size="lg"
                     onClick={() => {
                       setSelectedOrder(null);
                       openEditModal(selectedOrder);
                     }} 
                     className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white h-12 sm:h-10 text-base sm:text-sm font-bold shadow-md"
                     >
                     Edit Order
                   </Button>
                </div>
              </>
             )}
          </DialogContent>
        </Dialog>

        {/* Edit/Create Order Modal (Standard Form) */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Order' : 'Create New Order'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500">Domain</label>
                 <select 
                    className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                    value={formData.domain_id} 
                    onChange={e => setFormData({...formData, domain_id: e.target.value})}
                 >
                    <option value="">Select Domain...</option>
                    {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">Buyer Name</label>
                   <Input value={formData.buyer_name} onChange={e => setFormData({...formData, buyer_name: e.target.value})} placeholder="John Doe" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">Buyer Email</label>
                   <Input value={formData.buyer_email} onChange={e => setFormData({...formData, buyer_email: e.target.value})} placeholder="john@example.com" />
                 </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500">Price ($)</label>
                   <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500">Status</label>
                    <select 
                      className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500">Notes</label>
                 <textarea 
                   className="w-full h-24 rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" 
                   value={formData.notes} 
                   onChange={e => setFormData({...formData, notes: e.target.value})} 
                   placeholder="Add any relevant notes here..."
                 />
               </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminOrders;
