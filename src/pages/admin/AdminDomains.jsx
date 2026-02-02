
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Plus, Search, Edit, Trash2, Save, X, Star, LayoutGrid, List, AlignLeft, CheckSquare, Upload, AlertCircle, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import SEO from '@/components/SEO';
import { formatDateOnly } from '@/utils/formatDate';

const AdminDomains = () => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Single Domain Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    status: 'available',
    featured: false,
    registration_date: '',
    
    // Marketing Details
    category: '',
    tagline: '',
    description: '',
    market_rationale: '', // Analysis text
    
    // Lists (Comma Separated)
    use_cases: '', 
    usp_points: '',
    similar_domains: '' // Analysis (Comparables)
  });

  // Bulk Import Modal State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportStatus, setBulkImportStatus] = useState(null); // 'idle', 'processing', 'success', 'error'
  const [bulkImportResult, setBulkImportResult] = useState(null);

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
      // Prepare payload with array conversions
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        featured: formData.featured,
        registration_date: formData.registration_date || null,
        category: formData.category,
        tagline: formData.tagline,
        description: formData.description,
        market_rationale: formData.market_rationale,
        tld: `.${formData.name.split('.').pop() || 'com'}`,
        
        // Convert comma-separated strings to arrays
        use_cases: formData.use_cases.split(',').map(s => s.trim()).filter(Boolean),
        usp_points: formData.usp_points.split(',').map(s => s.trim()).filter(Boolean),
        similar_domains: formData.similar_domains.split(',').map(s => s.trim()).filter(Boolean),
      };

      let error;
      if (editingId) {
        const { error: err } = await supabase.from('domains').update(payload).eq('id', editingId);
        error = err;
      } else {
        const { error: err } = await supabase.from('domains').insert([payload]);
        error = err;
      }

      if (error) throw error;

      toast({ title: "Success", description: `Domain ${editingId ? 'updated' : 'added'} successfully.` });
      setIsModalOpen(false);
      fetchDomains();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Error", description: err.message });
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
      setFormData({
        name: domain.name || '',
        price: domain.price || '',
        status: domain.status || 'available',
        featured: domain.featured || false,
        registration_date: domain.registration_date ? domain.registration_date.split('T')[0] : '',
        
        category: domain.category || '',
        tagline: domain.tagline || '',
        description: domain.description || '',
        market_rationale: domain.market_rationale || '',
        
        use_cases: (domain.use_cases || []).join(', '),
        usp_points: (domain.usp_points || []).join(', '),
        similar_domains: (domain.similar_domains || []).join(', ')
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', price: '', status: 'available', featured: false, registration_date: '',
        category: '', tagline: '', description: '', market_rationale: '',
        use_cases: '', usp_points: '', similar_domains: ''
      });
    }
    setIsModalOpen(true);
  };

  // --- Bulk Import Logic ---

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) {
      toast({ variant: "destructive", title: "Empty Input", description: "Please paste domain data first." });
      return;
    }

    setBulkImportStatus('processing');
    setBulkImportResult(null);

    try {
      // 1. Parse Input (CSV or Newline separated)
      const lines = bulkImportText.split(/\r?\n/).filter(line => line.trim() !== '');
      
      const parsedDomains = lines.map(line => {
        // Try to handle simple CSV: name, price, category
        // Or just name
        const parts = line.split(',').map(p => p.trim());
        const name = parts[0];
        const price = parseFloat(parts[1]) || 0;
        const category = parts[2] || 'General';

        return {
          name: name.toLowerCase(),
          price,
          category,
          status: 'available',
          tld: `.${name.split('.').pop() || 'com'}`,
          featured: false
        };
      }).filter(d => d.name.includes('.')); // Basic validation: must have a dot

      if (parsedDomains.length === 0) {
        throw new Error("No valid domain names found. Please ensure format is correct.");
      }

      // 2. Fetch existing domains to check duplicates
      // We'll fetch just names to be efficient
      const { data: existingData, error: fetchError } = await supabase
        .from('domains')
        .select('name');

      if (fetchError) throw fetchError;

      const existingNames = new Set(existingData.map(d => d.name.toLowerCase()));

      // 3. Filter duplicates
      const newDomains = [];
      const skippedDomains = [];

      parsedDomains.forEach(domain => {
        if (existingNames.has(domain.name)) {
          skippedDomains.push(domain.name);
        } else {
          // Avoid duplicates within the import list itself
          if (!newDomains.some(d => d.name === domain.name)) {
            newDomains.push(domain);
          } else {
            skippedDomains.push(domain.name);
          }
        }
      });

      // 4. Insert new domains
      if (newDomains.length > 0) {
        // Insert in chunks of 50 to avoid payload limits if list is huge
        const chunkSize = 50;
        for (let i = 0; i < newDomains.length; i += chunkSize) {
          const chunk = newDomains.slice(i, i + chunkSize);
          const { error: insertError } = await supabase.from('domains').insert(chunk);
          if (insertError) throw insertError;
        }
      }

      setBulkImportResult({
        added: newDomains.length,
        skipped: skippedDomains.length,
        skippedNames: skippedDomains
      });
      setBulkImportStatus('success');
      
      // Refresh list
      fetchDomains();

      toast({ 
        title: "Import Complete", 
        description: `Added ${newDomains.length} domains. Skipped ${skippedDomains.length} duplicates.` 
      });

    } catch (err) {
      console.error(err);
      setBulkImportStatus('error');
      toast({ variant: "destructive", title: "Import Failed", description: err.message });
    }
  };

  const closeBulkImport = () => {
    setIsBulkImportOpen(false);
    setBulkImportText('');
    setBulkImportStatus(null);
    setBulkImportResult(null);
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

        {/* Search Bar */}
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

        {/* Domains Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> :
                filteredDomains.length === 0 ? <tr><td colSpan="6" className="p-8 text-center">No domains found.</td></tr> :
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
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Domain' : 'Add New Domain'}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4 space-y-8">
              
              {/* SECTION 1: Essential Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                  <LayoutGrid className="h-4 w-4" /> Essential Information
                </div>
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
                  <div className="col-span-2 sm:col-span-1">
                     <label className="text-xs font-bold text-slate-500 mb-1 block">Registration Date</label>
                     <div className="relative">
                       <Input 
                        type="date" 
                        value={formData.registration_date} 
                        onChange={e => setFormData({...formData, registration_date: e.target.value})} 
                       />
                       <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                     </div>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex items-center pt-6">
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
              </section>

              {/* SECTION 2: Marketing & Content */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                  <AlignLeft className="h-4 w-4" /> Marketing Details
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Category</label>
                    <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. FinTech, AI, SaaS" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Tagline</label>
                    <Input value={formData.tagline} onChange={e => setFormData({...formData, tagline: e.target.value})} placeholder="Short catchy phrase..." />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Full Description</label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      placeholder="Detailed description of the domain and its value..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Market Rationale / Analysis</label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={formData.market_rationale} 
                      onChange={e => setFormData({...formData, market_rationale: e.target.value})} 
                      placeholder="Why is this domain valuable? Market trends, branding potential, etc."
                    />
                  </div>
                </div>
              </section>

              {/* SECTION 3: Lists & SEO */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800 font-semibold border-b pb-2">
                  <List className="h-4 w-4" /> Features & Analysis (Comma Separated)
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Potential Use Cases</label>
                    <Input 
                      value={formData.use_cases} 
                      onChange={e => setFormData({...formData, use_cases: e.target.value})} 
                      placeholder="e.g. SaaS Platform, Mobile App, Tech Blog" 
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Separate multiple items with commas</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Unique Selling Points (USP)</label>
                    <Input 
                      value={formData.usp_points} 
                      onChange={e => setFormData({...formData, usp_points: e.target.value})} 
                      placeholder="e.g. 4-Letter, Dictionary Word, High Search Volume" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Similar Domains / Analysis</label>
                    <Input 
                      value={formData.similar_domains} 
                      onChange={e => setFormData({...formData, similar_domains: e.target.value})} 
                      placeholder="e.g. example.net, other.com" 
                    />
                  </div>
                </div>
              </section>

            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save Domain</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Modal */}
        <Dialog open={isBulkImportOpen} onOpenChange={closeBulkImport}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Import Domains</DialogTitle>
              <DialogDescription>
                Paste your domain list below. Duplicate domains (already in system) will be automatically skipped.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
               {/* Instructions */}
               <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-600 space-y-2 border border-slate-100">
                  <p className="font-semibold flex items-center"><FileText className="w-4 h-4 mr-2" /> Format Options:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Simple List:</strong> Just domain names, one per line.</li>
                    <li><strong>CSV Format:</strong> <code>domain.com, price, category</code> (e.g., <code>coolai.com, 5000, AI</code>)</li>
                  </ul>
                  <p className="text-xs text-slate-500 italic mt-2">Note: Price defaults to 0 and Category to "General" if not specified.</p>
               </div>

               {/* Text Area */}
               {!bulkImportResult ? (
                 <textarea
                   className="w-full h-64 p-4 text-sm font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                   placeholder={`example.com\ncoolstartups.io, 2500, Tech\nfintech.app, 10000, Finance\n...`}
                   value={bulkImportText}
                   onChange={(e) => setBulkImportText(e.target.value)}
                   disabled={bulkImportStatus === 'processing'}
                 />
               ) : (
                 <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center">
                    <CheckSquare className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-800 mb-2">Import Complete!</h3>
                    <div className="flex justify-center gap-8 text-sm mt-4">
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-emerald-600">{bulkImportResult.added}</span>
                        <span className="text-emerald-700">Added</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-500">{bulkImportResult.skipped}</span>
                        <span className="text-slate-600">Skipped (Duplicate)</span>
                      </div>
                    </div>
                    {bulkImportResult.skipped > 0 && (
                      <div className="mt-6 text-left bg-white p-3 rounded border border-emerald-100 max-h-32 overflow-y-auto">
                        <p className="text-xs font-bold text-slate-500 mb-1">Skipped Domains:</p>
                        <p className="text-xs text-slate-400 break-all">{bulkImportResult.skippedNames.join(', ')}</p>
                      </div>
                    )}
                 </div>
               )}
            </div>

            <DialogFooter>
               {!bulkImportResult ? (
                 <>
                   <Button variant="ghost" onClick={closeBulkImport} disabled={bulkImportStatus === 'processing'}>Cancel</Button>
                   <Button onClick={handleBulkImport} className="bg-emerald-600 hover:bg-emerald-700" disabled={bulkImportStatus === 'processing'}>
                     {bulkImportStatus === 'processing' ? 'Processing...' : 'Import Domains'}
                   </Button>
                 </>
               ) : (
                 <Button onClick={closeBulkImport} className="bg-slate-900 text-white">Close</Button>
               )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default AdminDomains;
