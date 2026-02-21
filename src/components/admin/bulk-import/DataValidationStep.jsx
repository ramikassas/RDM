
import React, { useMemo, useState } from 'react';
import { ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DataValidationStep = ({ rawData, mapping, onValidationComplete, onBack }) => {
  const [skippedRows, setSkippedRows] = useState(new Set());

  // Apply mapping and validate
  const validatedData = useMemo(() => {
    return rawData.map((row, index) => {
      const mappedRow = {};
      let isValid = true;
      const errors = [];

      Object.entries(mapping).forEach(([dbCol, csvHeader]) => {
        if (csvHeader) {
          mappedRow[dbCol] = row[csvHeader];
        } else {
          mappedRow[dbCol] = null;
        }
      });

      // Basic Validation
      if (!mappedRow.name) {
        isValid = false;
        errors.push("Missing name");
      } else if (!/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(mappedRow.name)) {
        isValid = false;
        errors.push("Invalid domain format");
      }

      if (mappedRow.price && isNaN(parseFloat(mappedRow.price))) {
        isValid = false;
        errors.push("Price must be numeric");
      }

      return { originalIndex: index, data: mappedRow, isValid, errors };
    });
  }, [rawData, mapping]);

  const handleNext = () => {
    const finalData = validatedData
      .filter((row, i) => row.isValid && !skippedRows.has(i))
      .map(row => row.data);
    onValidationComplete(finalData);
  };

  const toggleSkip = (index) => {
    const newSkipped = new Set(skippedRows);
    if (newSkipped.has(index)) newSkipped.delete(index);
    else newSkipped.add(index);
    setSkippedRows(newSkipped);
  };

  const validCount = validatedData.filter((r, i) => r.isValid && !skippedRows.has(i)).length;
  const invalidCount = validatedData.length - validCount;

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <div className="text-emerald-800 text-sm font-semibold">Valid Rows</div>
          <div className="text-2xl font-bold text-emerald-600">{validCount}</div>
        </div>
        <div className="flex-1 bg-red-50 p-4 rounded-lg border border-red-100">
          <div className="text-red-800 text-sm font-semibold">Invalid / Skipped</div>
          <div className="text-2xl font-bold text-red-600">{invalidCount}</div>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto border border-slate-200 rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Errors</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {validatedData.map((row, i) => (
              <tr key={i} className={`hover:bg-slate-50 ${skippedRows.has(i) ? 'opacity-50 bg-slate-100' : ''}`}>
                <td className="px-4 py-3">
                  {row.isValid ? (
                     <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                     <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{row.data.name || '-'}</td>
                <td className="px-4 py-3">{row.data.price || '-'}</td>
                <td className="px-4 py-3 text-red-500 text-xs">{row.errors.join(', ')}</td>
                <td className="px-4 py-3 text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleSkip(i)}
                    className={skippedRows.has(i) ? 'text-emerald-600' : 'text-slate-500'}
                  >
                    {skippedRows.has(i) ? 'Include' : 'Skip'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleNext} disabled={validCount === 0} className="bg-emerald-600 hover:bg-emerald-700">
          Continue ({validCount} valid) <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default DataValidationStep;
