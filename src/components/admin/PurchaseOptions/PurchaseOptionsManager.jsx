
import React, { useState, useEffect } from 'react';
import { AlertCircle, Plus, Save, Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { mergePurchaseOptions } from '@/utils/purchaseOptionsHelper';
import PurchaseOptionsButtonList from './PurchaseOptionsButtonList';
import PurchaseOptionsButtonForm from './PurchaseOptionsButtonForm';
import PurchaseOptionsPreview from './PurchaseOptionsPreview';

const PurchaseOptionsManager = ({ domainId, domainData, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // State for config
  const [config, setConfig] = useState({ builtIn: [], custom: [] });
  // Derived state for ordering and drag-drop list (all buttons combined)
  const [displayList, setDisplayList] = useState([]);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (domainData) {
      initializeData(domainData);
    } else if (domainId) {
      fetchDomainData();
    }
  }, [domainId, domainData]);

  const initializeData = (data) => {
    // 1. Get merged config from helper
    // Note: We use 'purchase_options_config' column.
    // If it's not present, mergePurchaseOptions handles the default fallback.
    const merged = mergePurchaseOptions(data.purchase_options_config);
    setConfig(merged);
    
    // 2. Create flat list for display
    const flat = [...merged.builtIn, ...merged.custom].sort((a, b) => a.order - b.order);
    setDisplayList(flat);
  };

  const fetchDomainData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('domains')
        .select('purchase_options_config')
        .eq('id', domainId)
        .single();
        
      if (error) throw error;
      initializeData(data);
    } catch (err) {
      console.error("Error fetching purchase options:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // When list changes (reorder), we update the flat list AND the underlying separated config
  const handleReorder = (newList) => {
    // 1. Update order index in objects
    const updatedList = newList.map((item, index) => ({
      ...item,
      order: index
    }));
    
    setDisplayList(updatedList);
    
    // 2. Update separated config
    setConfig({
      builtIn: updatedList.filter(i => i.type === 'built-in'),
      custom: updatedList.filter(i => i.type === 'custom')
    });
  };

  const handleToggle = (id, type) => {
    const updatedList = displayList.map(item => {
      if (item.id === id) {
        return { ...item, enabled: !item.enabled };
      }
      return item;
    });
    
    setDisplayList(updatedList);
    setConfig({
      builtIn: updatedList.filter(i => i.type === 'built-in'),
      custom: updatedList.filter(i => i.type === 'custom')
    });
  };

  const handleSaveButton = (buttonData) => {
    let newDisplayList;
    
    if (editingItem) {
      // Update existing
      newDisplayList = displayList.map(item => 
        item.id === buttonData.id ? { ...item, ...buttonData } : item
      );
    } else {
      // Add new
      newDisplayList = [...displayList, { ...buttonData, order: displayList.length }];
    }
    
    setDisplayList(newDisplayList);
    setConfig({
      builtIn: newDisplayList.filter(i => i.type === 'built-in'),
      custom: newDisplayList.filter(i => i.type === 'custom')
    });
    
    setIsAdding(false);
    setEditingItem(null);
  };

  const handleDelete = (id) => {
    const newDisplayList = displayList.filter(item => item.id !== id);
    setDisplayList(newDisplayList);
    setConfig({
      builtIn: newDisplayList.filter(i => i.type === 'built-in'),
      custom: newDisplayList.filter(i => i.type === 'custom')
    });
  };

  const saveToDatabase = async () => {
    setSaving(true);
    try {
      // We only strictly need to save what's different or custom.
      // But saving the whole object ensures consistency.
      const payload = {
        purchase_options_config: config
      };
      
      const { error } = await supabase
        .from('domains')
        .update(payload)
        .eq('id', domainId);

      if (error) throw error;
      
      toast({ title: "Saved", description: "Purchase options updated successfully." });
      if (onSaved) onSaved();
      
    } catch (err) {
      console.error("Save error:", err);
      toast({ variant: "destructive", title: "Error", description: "Failed to save options." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Col: Editor */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Manage Buttons</h3>
          <div className="flex gap-2">
            {!isAdding && !editingItem && (
              <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Custom Button
              </Button>
            )}
            <Button onClick={saveToDatabase} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
               {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
               Save Changes
            </Button>
          </div>
        </div>

        {(isAdding || editingItem) && (
          <PurchaseOptionsButtonForm 
            initialData={editingItem}
            onSave={handleSaveButton}
            onCancel={() => { setIsAdding(false); setEditingItem(null); }}
          />
        )}

        <div className="bg-slate-50/50 rounded-lg p-1">
          <p className="text-xs text-slate-500 mb-2 px-2">Drag to reorder. Toggle to enable/disable.</p>
          <PurchaseOptionsButtonList 
             items={displayList} 
             onReorder={handleReorder}
             onToggle={handleToggle}
             onEdit={(item) => { setEditingItem(item); setIsAdding(false); }}
             onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Right Col: Preview */}
      <div className="lg:col-span-1">
         <div className="sticky top-6">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-4 tracking-wider">Live Preview</h3>
            <PurchaseOptionsPreview buttons={displayList} />
         </div>
      </div>
    </div>
  );
};

export default PurchaseOptionsManager;
