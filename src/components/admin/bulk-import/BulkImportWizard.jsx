
import React, { useState } from 'react';
import CSVUploadStep from './CSVUploadStep';
import ColumnMappingStep from './ColumnMappingStep';
import DataValidationStep from './DataValidationStep';
import DuplicateCheckStep from './DuplicateCheckStep';
import ImportProgressStep from './ImportProgressStep';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STEPS = [
  'Upload CSV',
  'Map Columns',
  'Validate Data',
  'Duplicate Check',
  'Import'
];

const BulkImportWizard = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Data State
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [validData, setValidData] = useState([]);
  const [duplicateAction, setDuplicateAction] = useState('skip');
  const [duplicateNames, setDuplicateNames] = useState([]);

  const resetState = () => {
    setCurrentStep(0);
    setCsvHeaders([]);
    setRawData([]);
    setMapping({});
    setValidData([]);
    setDuplicateAction('skip');
    setDuplicateNames([]);
  };

  const handleClose = () => {
    if (currentStep === 4) return; // Prevent closing during import
    resetState();
    onClose();
  };

  const handleUploadComplete = (headers, data) => {
    setCsvHeaders(headers);
    setRawData(data);
    setCurrentStep(1);
  };

  const handleMappingComplete = (map) => {
    setMapping(map);
    setCurrentStep(2);
  };

  const handleValidationComplete = (filteredData) => {
    setValidData(filteredData);
    setCurrentStep(3);
  };

  const handleCheckComplete = (action, duplicates) => {
    setDuplicateAction(action);
    setDuplicateNames(duplicates);
    setCurrentStep(4);
  };

  const handleImportComplete = () => {
    resetState();
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Domains</DialogTitle>
        </DialogHeader>

        {/* Wizard Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            {STEPS.map((step, index) => (
              <React.Fragment key={step}>
                <div className={`text-xs font-semibold ${index <= currentStep ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {step}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${index < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Wizard Steps Content */}
        <div className="py-2">
          {currentStep === 0 && <CSVUploadStep onUpload={handleUploadComplete} />}
          {currentStep === 1 && <ColumnMappingStep csvHeaders={csvHeaders} onMappingComplete={handleMappingComplete} onBack={() => setCurrentStep(0)} />}
          {currentStep === 2 && <DataValidationStep rawData={rawData} mapping={mapping} onValidationComplete={handleValidationComplete} onBack={() => setCurrentStep(1)} />}
          {currentStep === 3 && <DuplicateCheckStep validData={validData} onCheckComplete={handleCheckComplete} onBack={() => setCurrentStep(2)} />}
          {currentStep === 4 && <ImportProgressStep validData={validData} duplicateAction={duplicateAction} duplicateNames={duplicateNames} onComplete={handleImportComplete} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportWizard;
