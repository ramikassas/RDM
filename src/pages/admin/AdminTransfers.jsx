
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { ExternalLink, Trash2, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminTransfers = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id, newStatus, notes) => {
    const { error } = await supabase
      .from('purchase_requests')
      .update({ 
        status: newStatus,
        admin_notes: notes 
      })
      .eq('id', id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Updated", description: `Transfer request marked as ${newStatus}.` });
      fetchRequests();
      if (selectedRequest) setSelectedRequest(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    
    // Optimistic update: Remove immediately from UI
    const previousRequests = [...requests];
    setRequests(prev => prev.filter(req => req.id !== id));
    if (selectedRequest?.id === id) setSelectedRequest(null);

    try {
      const { error } = await supabase
        .from('purchase_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: "Deleted", description: "Request removed permanently." });
    } catch (err) {
      // Revert changes if failed
      setRequests(previousRequests);
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  const openDetails = (req) => {
    setSelectedRequest(req);
    setAdminNote(req.admin_notes || '');
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      pending_transfer: "bg-blue-100 text-blue-700",
      processing: "bg-amber-100 text-amber-700",
      completed: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-slate-100 text-slate-600"
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || styles.pending_transfer}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  return (
    <>
      <SEO title="Transfer Requests | RDM Admin" />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Domain Transfer Requests</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Domain</th>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Proof</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                   <tr><td colSpan="6" className="p-8 text-center">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                   <tr><td colSpan="6" className="p-8 text-center">No transfer requests found.</td></tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {formatDate(req.created_at)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {req.domain_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{req.buyer_name}</div>
                        <div className="text-xs text-slate-500">{req.buyer_email}</div>
                      </td>
                      <td className="px-6 py-4">
                        {req.payment_screenshot_url ? (
                          <a 
                            href={req.payment_screenshot_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1 text-xs font-medium"
                          >
                            <ExternalLink className="h-3 w-3" /> View Proof
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openDetails(req)}>
                          <Eye className="h-4 w-4 mr-1" /> Details
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(req.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Transfer Details: {selectedRequest?.domain_name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4 text-sm">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase">Buyer Name</label>
                 <p className="text-slate-900">{selectedRequest?.buyer_name}</p>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase">Contact Email</label>
                 <p className="text-slate-900">{selectedRequest?.buyer_email}</p>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase">Phone</label>
                 <p className="text-slate-900">{selectedRequest?.buyer_phone || 'N/A'}</p>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase">Submission Date</label>
                 <p className="text-slate-900">{selectedRequest && formatDate(selectedRequest.created_at)}</p>
               </div>
            </div>
            
            {selectedRequest?.payment_screenshot_url && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                 <p className="text-xs font-bold text-slate-500 uppercase mb-2">Payment Verification</p>
                 <div className="flex items-center justify-between">
                   <span className="text-slate-700 truncate max-w-[200px]">{selectedRequest.payment_screenshot_url.split('/').pop()}</span>
                   <a 
                      href={selectedRequest.payment_screenshot_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-700 font-medium flex items-center"
                   >
                     Open Image <ExternalLink className="ml-1.5 h-3 w-3" />
                   </a>
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Admin Notes</label>
              <textarea 
                className="w-full border border-slate-200 rounded-md p-2 text-sm h-20"
                placeholder="Internal notes about this transfer..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex gap-2 w-full justify-end">
                 <Button variant="outline" onClick={() => updateStatus(selectedRequest.id, 'rejected', adminNote)} className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                   Reject
                 </Button>
                 <Button variant="outline" onClick={() => updateStatus(selectedRequest.id, 'processing', adminNote)} className="text-amber-600 hover:bg-amber-50 border-amber-200">
                   Process
                 </Button>
                 <Button onClick={() => updateStatus(selectedRequest.id, 'completed', adminNote)} className="bg-emerald-600 hover:bg-emerald-700">
                   <CheckCircle className="w-4 h-4 mr-2" /> Complete
                 </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminTransfers;
