
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import PurchaseOptionsManager from './PurchaseOptionsManager';

const PurchaseOptionsTab = ({ domainId, domainData, onRefresh }) => {
  if (!domainId) {
    return (
       <div className="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
          <p>Please save the domain first to manage purchase options.</p>
       </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
       <Alert className="bg-blue-50 border-blue-100">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-xs">
            These settings control which action buttons appear in the sidebar of the domain detail page. 
            You can reorder them, toggle visibility, or add custom links (e.g., to external checkout pages).
          </AlertDescription>
       </Alert>
       
       <PurchaseOptionsManager 
          domainId={domainId} 
          domainData={domainData}
          onSaved={onRefresh} 
       />
    </div>
  );
};

export default PurchaseOptionsTab;
