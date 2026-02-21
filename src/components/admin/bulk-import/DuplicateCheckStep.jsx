
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DuplicateCheckStep = ({ validData, onCheckComplete, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [duplicates, setDuplicates] = useState([]);
  const [duplicateAction, setDuplicateAction] = useState('skip'); // skip or overwrite

  useEffect(() => {
    const checkDuplicates = async () => {
      setLoading(true);
      const names = validData.map(d => d.name);
      
      try {
        const { data, error } = await supabase
          .from('domains')
          .select('name')
          .in('name', names);
          
        if (error) throw error;
        setDuplicates(data.map(d => d.name));
      } catch (err) {
        console.error("Duplicate check error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkDuplicates();
  }, [validData]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600">Checking for existing domains...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Import Summary</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Total domains to process: <strong>{validData.length}</strong></li>
          <li>New domains: <strong>{validData.length - duplicates.length}</strong></li>
          <li>Duplicates found: <strong>{duplicates.length}</strong></li>
        </ul>
      </div>

      {duplicates.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-800">Duplicate Action</h4>
          <div className="flex gap-4">
            <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${duplicateAction === 'skip' ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 hover:border-emerald-300'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-emerald-900">Skip Duplicates</span>
                {duplicateAction === 'skip' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <input type="radio" className="hidden" checked={duplicateAction === 'skip'} onChange={() => setDuplicateAction('skip')} />
              <p className="text-xs text-slate-500">Existing domains will be ignored. Only new ones will be added.</p>
            </label>
            <label className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${duplicateAction === 'overwrite' ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-amber-900">Overwrite Existing</span>
                {duplicateAction === 'overwrite' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <input type="radio" className="hidden" checked={duplicateAction === 'overwrite'} onChange={() => setDuplicateAction('overwrite')} />
              <p className="text-xs text-slate-500">Updates existing domains with the new CSV data.</p>
            </label>
          </div>
          
          <div className="max-h-[30vh] overflow-y-auto border border-slate-200 rounded-md bg-white p-3">
            <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase">Duplicates List</h5>
            <div className="flex flex-wrap gap-2">
              {duplicates.map(name => (
                <span key={name} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">{name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={() => onCheckComplete(duplicateAction, duplicates)} className="bg-emerald-600 hover:bg-emerald-700">
          Start Import <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default DuplicateCheckStep;
