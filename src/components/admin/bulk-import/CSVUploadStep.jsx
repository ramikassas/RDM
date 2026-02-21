
import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CSVUploadStep = ({ onUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const processFile = (file) => {
    setError(null);
    if (!file) return;
    
    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      setError("Please upload a valid CSV file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError("Failed to parse CSV file.");
        } else {
          onUpload(results.meta.fields, results.data);
        }
      },
      error: (err) => {
        setError(err.message);
      }
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <UploadCloud className={`mx-auto h-12 w-12 mb-4 ${dragActive ? 'text-emerald-500' : 'text-slate-400'}`} />
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Upload CSV File</h3>
        <p className="text-sm text-slate-500 mb-4">Drag and drop your file here, or click to browse</p>
        <p className="text-xs text-slate-400 mb-6">Maximum file size: 10MB</p>
        
        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition font-medium text-sm">
          <FileType className="w-4 h-4 mr-2" /> Select File
          <input type="file" accept=".csv" className="hidden" onChange={handleChange} />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-md text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default CSVUploadStep;
