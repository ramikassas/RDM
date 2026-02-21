
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DB_COLUMNS = [
  'name', 'price', 'description', 'category', 'status', 'logo_url', 'tld', 
  'featured', 'tagline', 'use_cases', 'usp_points', 'market_rationale', 
  'similar_domains', 'technical_specifications', 'registry', 'transfer_type', 'renewal_price'
];

const ColumnMappingStep = ({ csvHeaders, onMappingComplete, onBack }) => {
  const [mapping, setMapping] = useState({});

  useEffect(() => {
    const initialMapping = {};
    DB_COLUMNS.forEach(dbCol => {
      // Auto-match if exact or similar
      const match = csvHeaders.find(h => 
        h.toLowerCase() === dbCol.toLowerCase() || 
        h.toLowerCase().replace(/[^a-z]/g, '') === dbCol.toLowerCase().replace(/[^a-z]/g, '')
      );
      if (match) {
        initialMapping[dbCol] = match;
      } else {
        initialMapping[dbCol] = '';
      }
    });
    setMapping(initialMapping);
  }, [csvHeaders]);

  const handleChange = (dbCol, csvHeader) => {
    setMapping(prev => ({ ...prev, [dbCol]: csvHeader }));
  };

  const handleNext = () => {
    // Only require 'name'
    if (!mapping.name) {
      alert("You must map a column to 'name'");
      return;
    }
    onMappingComplete(mapping);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
        Map your CSV columns to the corresponding database fields. <strong>Domain Name (name)</strong> is required.
      </div>

      <div className="max-h-[50vh] overflow-y-auto border border-slate-200 rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700">Database Field</th>
              <th className="px-4 py-3 font-semibold text-slate-700">CSV Column</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {DB_COLUMNS.map(dbCol => (
              <tr key={dbCol} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {dbCol} {dbCol === 'name' && <span className="text-red-500">*</span>}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm bg-white"
                    value={mapping[dbCol] || ''}
                    onChange={(e) => handleChange(dbCol, e.target.value)}
                  >
                    <option value="">-- Ignore / No mapping --</option>
                    {csvHeaders.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext} className="bg-emerald-600 hover:bg-emerald-700">
          Next Step <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ColumnMappingStep;
