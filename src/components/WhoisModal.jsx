import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Copy, Shield, Server, Calendar, Globe } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const WhoisModal = ({ isOpen, onClose, data, loading, error, domain }) => {
  const { toast } = useToast();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
      duration: 2000,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getEventDate = (events, action) => {
    const event = events?.find(e => e.eventAction === action);
    return event ? formatDate(event.eventDate) : 'N/A';
  };

  const getRegistrar = (entities) => {
    const registrar = entities?.find(e => e.roles?.includes('registrar'));
    if (!registrar) return { name: 'Unknown', email: null };
    
    const vcard = registrar.vcardArray?.[1];
    const fn = vcard?.find(item => item[0] === 'fn');
    const name = fn ? fn[3] : (registrar.handle || 'Unknown');
    
    return { name };
  };

  const registrar = data ? getRegistrar(data.entities) : null;
  const registrationDate = data ? getEventDate(data.events, 'registration') : null;
  const expirationDate = data ? getEventDate(data.events, 'expiration') : null;
  const lastChangedDate = data ? getEventDate(data.events, 'last changed') : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-100 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
             <Globe className="w-5 h-5 text-emerald-600" />
             WHOIS Lookup: {domain}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-4"></div>
             <p>Fetching RDAP data...</p>
          </div>
        ) : error ? (
           <div className="py-8 text-center text-red-600 bg-red-50 rounded-lg p-4">
             <p className="font-semibold">Error fetching WHOIS data</p>
             <p className="text-sm mt-1">{error}</p>
           </div>
        ) : data ? (
           <div className="space-y-6 py-2">
              <section>
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Shield className="w-4 h-4" /> Domain Status
                 </h3>
                 <div className="flex flex-wrap gap-2">
                   {data.status?.map((status, idx) => (
                     <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">
                       {status}
                     </span>
                   )) || <span className="text-slate-400 italic">No status data</span>}
                 </div>
              </section>

              <section className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Registrar Information</h3>
                 <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                       <span className="text-slate-500">Registrar:</span>
                       <span className="font-medium text-slate-900">{registrar?.name}</span>
                    </div>
                    {data.handle && (
                      <div className="flex justify-between">
                         <span className="text-slate-500">Registry ID:</span>
                         <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{data.handle}</span>
                            <Button variant="ghost" size="icon" className="h-4 w-4 text-slate-400 hover:text-emerald-600" onClick={() => copyToClipboard(data.handle, "Registry ID")}>
                              <Copy className="h-3 w-3" />
                            </Button>
                         </div>
                      </div>
                    )}
                 </div>
              </section>

              <section>
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                   <Calendar className="w-4 h-4" /> Critical Dates
                 </h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-200 rounded-lg">
                       <div className="text-xs text-slate-500 mb-1">Registration Date</div>
                       <div className="font-semibold text-slate-800">{registrationDate}</div>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg bg-emerald-50 border-emerald-100">
                       <div className="text-xs text-emerald-600 mb-1">Expiration Date</div>
                       <div className="font-semibold text-emerald-900">{expirationDate}</div>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg sm:col-span-2">
                       <div className="text-xs text-slate-500 mb-1">Last Updated</div>
                       <div className="font-semibold text-slate-800">{lastChangedDate}</div>
                    </div>
                 </div>
              </section>

              {data.nameservers && data.nameservers.length > 0 && (
                <section>
                   <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                     <Server className="w-4 h-4" /> Nameservers
                   </h3>
                   <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {data.nameservers.map((ns, idx) => (
                        <li key={idx} className="text-xs font-mono bg-slate-900 text-slate-200 p-2 rounded truncate">
                           {ns.ldhName}
                        </li>
                      ))}
                   </ul>
                </section>
              )}
           </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default WhoisModal;