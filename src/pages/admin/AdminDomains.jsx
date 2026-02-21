import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Search, Edit, Trash2, CheckSquare, Upload, Star, FileImage as ImageIcon, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SEO from '@/components/SEO';
import { formatDateOnly } from '@/utils/formatDate';
import DomainLogoUpload from '@/components/admin/DomainLogoUpload';
import PurchaseOptionsTab from '@/components/admin/PurchaseOptions/PurchaseOptionsTab';
import BulkImportWizard from '@/components/admin/bulk-import/BulkImportWizard';

const AdminDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Single Domain Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // We keep the full domain object for passing to child components
  const [currentDomain, setCurrentDomain] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: 'available',
    featured: false,
    registry: '',
    transfer_type: '',
    renewal_price: '',
    listed_date: '',
    registration_date: '',
    category: '',
    tagline: '',
    description: '',
    market_rationale: '',
    use_cases: '', 
    usp_points: '',
    technical_specifications: '',
    logo_url: null,
    logo_alt_text: '',
    logo_uploaded_at: null,
    purchase_options_config: null
  });

  // Bulk Import Modal State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } else {
      setDomains(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        featured: formData.featured,
        registry: formData.registry,
        transfer_type: formData.transfer_type,
        renewal_price: formData.renewal_price,
        listed_date: formData.listed_date || null,
        registration_date: formData.registration_date || null,
        category: formData.category,
        tagline: formData.tagline,
        description: formData.description,
        market_rationale: formData.market_rationale,
        technical_specifications: formData.technical_specifications,
        tld: `.${formData.name.split('.').pop() || 'com'}`,
        use_cases: formData.use_cases.split(',').map(s => s.trim()).filter(Boolean),
        usp_points: formData.usp_points.split(',').map(s => s.trim()).filter(Boolean),
        logo_url: formData.logo_url,
        logo_alt_text: formData.logo_alt_text,
        logo_uploaded_at: formData.logo_uploaded_at,
        // preserve existing config if we are just editing main fields, 
        // unless specifically updated by manager (which handles its own saves mostly)
        purchase_options_config: formData.purchase_options_config
      };

      let error;
      let newId = editingId;

      if (editingId) {
        const { error: err } = await supabase.from('domains').update(payload).eq('id', editingId);
        error = err;
      } else {
        const { data: newDomain, error: err } = await supabase.from('domains').insert([payload]).select().single();
        error = err;
        if (newDomain) newId = newDomain.id;
      }

      if (error) throw error;

      toast({ title: "Success", description: `Domain ${editingId ? 'updated' : 'added'} successfully.` });
      setIsModalOpen(false);
      fetchDomains();
      return newId;
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.message });
      return null;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else {
      toast({ title: "Deleted", description: "Domain deleted successfully." });
      fetchDomains();
    }
  };

  const openModal = (domain = null) => {
    if (domain) {
      setEditingId(domain.id);
      setCurrentDomain(domain);
      setFormData({
        name: domain.name || '',
        price: domain.price || '',
        status: domain.status || 'available',
        featured: domain.featured || false,
        registry: domain.registry || '',
        transfer_type: domain.transfer_type || '',
        renewal_price: domain.renewal_price || '',
        listed_date: domain.listed_date || '',
        registration_date: domain.registration_date ? domain.registration_date.split('T')[0] : '',
        category: domain.category || '',
        tagline: domain.tagline || '',
        description: domain.description || '',
        market_rationale: domain.market_rationale || '',
        technical_specifications: domain.technical_specifications || '',
        use_cases: (domain.use_cases || []).join(', '),
        usp_points: (domain.usp_points || []).join(', '),
        logo_url: domain.logo_url || null,
        logo_alt_text: domain.logo_alt_text || '',
        logo_uploaded_at: domain.logo_uploaded_at || null,
        purchase_options_config: domain.purchase_options_config || null
      });
    } else {
      setEditingId(null);
      setCurrentDomain(null);
      setFormData({
        name: '', price: '', status: 'available', featured: false,
        registry: '', transfer_type: '', renewal_price: '', listed_date: '', registration_date: '',
        category: '', tagline: '', description: '', market_rationale: '', technical_specifications: '',
        use_cases: '', usp_points: '',
        logo_url: null, logo_alt_text: '', logo_uploaded_at: null,
        purchase_options_config: null
      });
    }
    setIsModalOpen(true);
  };

  const handleLogoUpdate = async (logoData) => {
    setFormData(prev => ({ ...prev, ...logoData }));
    
    if (editingId) {
      const { error } = await supabase
        .from('domains')
        .update(logoData)
        .eq('id', editingId);
        
      if (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to save logo details to domain." });
      } else {
        fetchDomains();
      }
    }
  };
  
  const refreshCurrentDomain = async () => {
    if (editingId) {
        const { data } = await supabase.from('domains').select('*').eq('id', editingId).single();
        if (data) {
            setCurrentDomain(data);
            setFormData(prev => ({
                ...prev,
                purchase_options_config: data.purchase_options_config
            }));
        }
    }
    fetchDomains(); // refresh list
  };

  const filteredDomains = domains.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <SEO title="Domains Inventory | RDM Admin" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Domains Inventory</h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setIsBulkImportOpen(true)} variant="outline" className="border-emerald-200 hover:bg-emerald-50 text-emerald-700">
              <Upload className="mr-2 h-4 w-4" /> Bulk Import
            </Button>
            <Button onClick={() => openModal()} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" /> Add Domain
            </Button>
          </div>
        </div>

        <div className="flex items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search domains..."
            className="flex-1 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Logo</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr> :
                filteredDomains.length === 0 ? <tr><td colSpan="7" className="p-8 text-center">No domains found.</td></tr> :
                filteredDomains.map(domain => (
                  <tr key={domain.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {domain.name}
                      <div className="text-xs text-slate-400 mt-0.5">Created: {formatDateOnly(domain.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{domain.category || '-'}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">${Number(domain.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                        domain.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        domain.status === 'sold' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {domain.status}
                      </span>
                    </td>
                     <td className="px-6 py-4 text-center">
                      {domain.logo_url ? <CheckSquare className="h-4 w-4 text-emerald-500 inline-block" /> : <span className="text-slate-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {domain.featured && <Star className="h-4 w-4 text-amber-400 inline-block fill-amber-400" />}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(domain)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(domain.id)}><Trash2 className="h-4 w-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit/Create Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Domain' : 'Add New Domain'}</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="essential" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="essential">Info</TabsTrigger>
                <TabsTrigger value="registry">Registry</TabsTrigger>
                <TabsTrigger value="marketing">Marketing</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="logo">Logo</TabsTrigger>
                <TabsTrigger value="purchase_options">
                   <CreditCard className="w-3 h-3 mr-1" /> Buttons
                </TabsTrigger>
              </TabsList>

              <div className="py-4">
                <TabsContent value="essential" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Domain Name</label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="example.com" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Price (USD)</label>
                      <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="5000" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                      <select 
                        className="w-full h-10 rounded-md border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="available">Available</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                    
                    <div className="col-span-2 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 transition"
                          checked={formData.featured}
                          onChange={e => setFormData({...formData, featured: e.target.checked})}
                        />
                        <span className="text-sm font-medium text-slate-700">Featured Domain</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="registry" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="col-span-2 sm:col-span-1">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">Registry</label>
                       <Input value={formData.registry} onChange={e => setFormData({...formData, registry: e.target.value})} placeholder="e.g. Verisign, GoDaddy" />
                     </div>
                     <div className="col-span-2 sm:col-span-1">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">Transfer Type</label>
                       <Input value={formData.transfer_type} onChange={e => setFormData({...formData, transfer_type: e.target.value})} placeholder="e.g. Auth Code / Push" />
                     </div>
                     <div className="col-span-2 sm:col-span-1">
                       <label className="text-xs font-bold text-slate-500 mb-1 block">Renewal Price</label>
                       <Input value={formData.renewal_price} onChange={e => setFormData({...formData, renewal_price: e.target.value})} placeholder="e.g. Standard Rate" />
                     </div>
                     <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Listed Date</label>
                        <Input 
                         type="date" 
                         value={formData.listed_date} 
                         onChange={e => setFormData({...formData, listed_date: e.target.value})} 
                        />
                     </div>
                     <div className="col-span-2 sm:col-span-1">
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Registration Date</label>
                        <Input 
                         type="date" 
                         value={formData.registration_date} 
                         onChange={e => setFormData({...formData, registration_date: e.target.value})} 
                        />
                     </div>
                  </div>
                </TabsContent>

                <TabsContent value="marketing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                      <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. FinTech" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Tagline</label>
                      <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} placeholder="Catchy phrase..." />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Description</label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1 block">Market Rationale</label>
                      <textarea 
                        className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={formData.market_rationale} 
                        onChange={e => setFormData({...formData, market_rationale: e.target.value})} 
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Potential Use Cases (Comma Separated)</label>
                    <Input value={formData.use_cases} onChange={e => setFormData({...formData, use_cases: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Unique Selling Points</label>
                    <Input value={formData.usp_points} onChange={e => setFormData({...formData, usp_points: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Technical Specifications</label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.technical_specifications} 
                      onChange={e => setFormData({...formData, technical_specifications: e.target.value})} 
                      placeholder="Enter technical details, registrar info, or custom notes..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="logo">
                   {editingId ? (
                     <DomainLogoUpload 
                        domainId={editingId}
                        domainName={formData.name}
                        initialUrl={formData.logo_url}
                        initialAlt={formData.logo_alt_text}
                        onSave={handleLogoUpdate}
                     />
                   ) : (
                     <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                        <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <h3 className="text-slate-600 font-medium">Create Domain First</h3>
                        <p className="text-slate-400 text-sm mt-1">Please save the essential details for this domain before uploading a logo.</p>
                     </div>
                   )}
                </TabsContent>

                <TabsContent value="purchase_options">
                    <PurchaseOptionsTab 
                       domainId={editingId}
                       domainData={currentDomain}
                       onRefresh={refreshCurrentDomain}
                    />
                </TabsContent>

              </div>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save Domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Wizard Integration */}
        <BulkImportWizard 
          isOpen={isBulkImportOpen} 
          onClose={() => setIsBulkImportOpen(false)}
          onComplete={() => {
            setIsBulkImportOpen(false);
            fetchDomains();
            toast({ title: 'Success', description: 'Bulk import process completed.' });
          }}
        />
      </div>
    </>
  );
};

export default AdminDomains;
