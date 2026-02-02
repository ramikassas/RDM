
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Mail, Trash2, CheckCircle, MailOpen, Clock, Search, User, Calendar, X, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import { formatDate } from '@/utils/formatDate';

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    // Optimistic update
    const prevMessages = [...messages];
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) setSelectedMessage(null);

    const { error } = await supabase.from('contact_messages').delete().eq('id', id);

    if (error) {
      // Revert if failed
      setMessages(prevMessages);
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Message removed permanently." });
    }
  };

  const handleMarkRead = async (id, currentStatus, e) => {
    if (e) e.stopPropagation();
    const newStatus = currentStatus === 'read' ? 'unread' : 'read';
    
    // Optimistic update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    if (selectedMessage?.id === id) {
        setSelectedMessage(prev => ({ ...prev, status: newStatus }));
    }

    const { error } = await supabase.from('contact_messages').update({ status: newStatus }).eq('id', id);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      fetchMessages(); // Revert/Refresh
    } else {
      toast({ title: "Status Updated", description: `Marked as ${newStatus}.` });
    }
  };

  const openMessage = async (message) => {
    setSelectedMessage(message);
    if (message.status !== 'read') {
      await handleMarkRead(message.id, 'unread'); 
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO title="Messages | RDM Admin" />
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="max-w-[1200px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
              <p className="text-slate-500 mt-1">Manage incoming inquiries and support requests.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9 bg-white border-slate-200 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]">Date</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[220px]">Sender</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[100px]">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-500">Loading messages...</td></tr>
                  ) : filteredMessages.length === 0 ? (
                    <tr><td colSpan="5" className="p-12 text-center text-slate-500">No messages found matching your criteria.</td></tr>
                  ) : (
                    filteredMessages.map((msg) => (
                      <tr 
                        key={msg.id} 
                        onClick={() => openMessage(msg)}
                        className={`group transition-all duration-200 hover:bg-slate-50 cursor-pointer h-[64px] ${msg.status !== 'read' ? 'bg-blue-50/30' : ''}`}
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {formatDate(msg.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-col justify-center">
                            <span className={`text-sm truncate max-w-[200px] ${msg.status !== 'read' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {msg.name}
                            </span>
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">{msg.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`text-sm truncate block max-w-md ${msg.status !== 'read' ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                            {msg.subject}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                            msg.status === 'read' 
                              ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {msg.status === 'read' ? 'Read' : 'New'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                              onClick={(e) => handleMarkRead(msg.id, msg.status, e)}
                              title={msg.status === 'read' ? "Mark as Unread" : "Mark as Read"}
                            >
                              {msg.status === 'read' ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                              onClick={(e) => handleDelete(msg.id, e)}
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
              ) : filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No messages found.</div>
              ) : (
                filteredMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    onClick={() => openMessage(msg)}
                    className={`p-4 active:bg-slate-50 transition-colors cursor-pointer ${msg.status !== 'read' ? 'bg-blue-50/20' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${msg.status === 'read' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                        <span className="text-xs text-slate-500 font-medium">{formatDate(msg.created_at)}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        msg.status === 'read' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {msg.status}
                      </span>
                    </div>
                    
                    <h3 className={`text-base mb-1 leading-snug ${msg.status !== 'read' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {msg.subject}
                    </h3>
                    
                    <div className="flex justify-between items-end mt-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{msg.name}</p>
                        <p className="text-xs text-slate-500">{msg.email}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-slate-400"
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Premium Message Details Modal */}
        <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
          <DialogContent className="sm:max-w-[700px] w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] p-0 gap-0 bg-white sm:rounded-2xl overflow-hidden flex flex-col border-0 shadow-2xl">
            
            {selectedMessage && (
              <>
                {/* Modal Header - Sticky */}
                <div className="shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 bg-white z-10 relative">
                  <div className="flex items-center gap-3 overflow-hidden pr-8">
                     <div className="grid gap-1">
                         <h2 className="font-bold text-lg sm:text-xl text-slate-900 truncate leading-tight">{selectedMessage.subject}</h2>
                         <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="hidden sm:inline">From:</span>
                            <span className="font-medium text-slate-900">{selectedMessage.name}</span>
                         </div>
                     </div>
                  </div>
                </div>

                {/* Premium Gradient Bar */}
                <div className="shrink-0 hidden sm:block h-1 bg-gradient-to-r from-blue-500 to-indigo-500 w-full" />

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
                  
                  {/* Sender Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sender Email</label>
                         <div className="flex items-center gap-2 font-medium text-slate-900 text-sm break-all">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {selectedMessage.email}
                         </div>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received Date</label>
                         <div className="flex items-center gap-2 font-medium text-slate-900 text-sm">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {formatDate(selectedMessage.created_at)}
                         </div>
                      </div>
                  </div>

                  {/* Message Content */}
                  <div className="space-y-3">
                     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Message Content</label>
                     <div className="bg-slate-50 rounded-xl p-4 sm:p-6 text-slate-700 border border-slate-100 leading-relaxed whitespace-pre-wrap text-sm sm:text-base shadow-sm min-h-[150px]">
                        {selectedMessage.message}
                     </div>
                  </div>

                  {/* ID / Status Footer */}
                  <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-50">
                      <span className="text-[10px] text-slate-300 font-mono uppercase tracking-widest">ID: {selectedMessage.id}</span>
                      {selectedMessage.status === 'unread' && (
                         <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">New Message</Badge>
                      )}
                  </div>
                </div>

                {/* Footer Actions - Sticky Bottom */}
                <div className="shrink-0 p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row justify-between gap-3 sm:gap-4">
                   <Button 
                     variant="destructive" 
                     onClick={(e) => handleDelete(selectedMessage.id, e)}
                     className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white border-0 shadow-sm h-12 sm:h-10"
                   >
                     <Trash2 className="w-4 h-4 mr-2" /> Delete Message
                   </Button>
                   <Button 
                      variant="outline" 
                      onClick={() => setSelectedMessage(null)}
                      className="w-full sm:w-auto h-12 sm:h-10 border-slate-200 hover:bg-slate-50 text-slate-700"
                   >
                     Close
                   </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default AdminMessages;
