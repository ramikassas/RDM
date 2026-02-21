
import React, { useEffect } from 'react';
import { useBulkImport } from '@/hooks/useBulkImport';
import { CheckCircle, AlertCircle, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateImportReport } from '@/utils/ImportReportGenerator';

const ImportProgressStep = ({ validData, duplicateAction, duplicateNames, onComplete }) => {
  const { isImporting, progress, results, startImport } = useBulkImport();

  useEffect(() => {
    // Only run once
    startImport(validData, duplicateAction, duplicateNames);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const successCount = results.filter(r => r.status === 'success').length;
  const skipCount = results.filter(r => r.status === 'skipped').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        {isImporting ? (
          <>
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Importing Domains...</h3>
            <p className="text-slate-500 text-sm">Please do not close this window</p>
          </>
        ) : (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">Import Complete!</h3>
            <p className="text-slate-500 text-sm">All operations finished.</p>
          </>
        )}
      </div>

      <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-emerald-500 h-4 transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-right text-xs text-slate-500 font-medium">{progress}%</div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
          <div className="text-2xl font-bold text-emerald-600">{successCount}</div>
          <div className="text-xs font-semibold text-emerald-800 uppercase">Success</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-2xl font-bold text-slate-600">{skipCount}</div>
          <div className="text-xs font-semibold text-slate-800 uppercase">Skipped</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs font-semibold text-red-800 uppercase">Errors</div>
        </div>
      </div>

      {!isImporting && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
          <Button variant="outline" onClick={() => generateImportReport(results)}>
            <Download className="w-4 h-4 mr-2" /> Download Report
          </Button>
          <Button onClick={onComplete} className="bg-emerald-600 hover:bg-emerald-700">
            Close & Refresh
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImportProgressStep;
