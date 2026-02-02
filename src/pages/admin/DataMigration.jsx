
import React, { useState } from 'react';
import { migrateFooterData } from '@/utils/migrateFooterData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DataMigration = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setLoading(true);
    try {
      const migrationResult = await migrateFooterData();
      setResult(migrationResult);
      
      if (migrationResult.success) {
        toast({ title: "Migration Complete", description: "Data setup finished successfully." });
      } else {
        toast({ variant: "destructive", title: "Migration Failed", description: migrationResult.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">System Data Setup</h1>
        <p className="text-slate-500 mt-2">One-time setup tools to migrate hardcoded application data to the database.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle>Footer Data Migration</CardTitle>
              <CardDescription>
                Transfers hardcoded contact info and social media links from the legacy Footer component into Supabase tables.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm space-y-3">
            <h4 className="font-semibold text-slate-700">Data to be migrated:</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>
                <strong>Contact Info:</strong> Heading ("Have questions? Reach out to us!"), Email ("info@rdm.bz")
              </li>
              <li>
                <strong>Social Links:</strong> Twitter (@rdm_bz), Instagram (@rdm_bz)
              </li>
            </ul>
            <p className="text-xs text-slate-500 italic mt-2">
              Note: If data already exists in the database, the migration for that section will be skipped to prevent duplicates.
            </p>
          </div>

          {!result ? (
            <Button onClick={handleMigration} disabled={loading} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Start Migration
            </Button>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-bold ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {result.success ? 'Process Completed' : 'Process Failed'}
                    </h4>
                    {result.error && <p className="text-red-600 text-sm mt-1">{result.error}</p>}
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {/* Contact Result */}
                 <div className="border border-slate-200 rounded-lg p-4">
                   <h5 className="font-bold text-slate-700 text-sm mb-2">Contact Info</h5>
                   <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                       result.contact.status === 'migrated' ? 'bg-green-100 text-green-700' : 
                       result.contact.status === 'skipped' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {result.contact.status}
                     </span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">{result.contact.message}</p>
                 </div>

                 {/* Socials Result */}
                 <div className="border border-slate-200 rounded-lg p-4">
                   <h5 className="font-bold text-slate-700 text-sm mb-2">Social Links</h5>
                   <div className="flex items-center justify-between">
                     <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                       result.socials.status === 'migrated' ? 'bg-green-100 text-green-700' : 
                       result.socials.status === 'skipped' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {result.socials.status}
                     </span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">{result.socials.message} ({result.socials.count} items)</p>
                 </div>
               </div>
               
               <div className="flex justify-end pt-2">
                 <Button variant="outline" onClick={() => window.location.reload()}>
                   Reset Form
                 </Button>
               </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataMigration;
