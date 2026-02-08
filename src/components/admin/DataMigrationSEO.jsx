
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAutoPopulateSEO } from '@/hooks/useAutoPopulateSEO';

const DataMigrationSEO = () => {
  const { populateAll, loading, error } = useAutoPopulateSEO();
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    const res = await populateAll();
    setResult(res);
  };

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Wand2 className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <CardTitle>Auto-Populate SEO Data</CardTitle>
            <CardDescription>
              Automatically generate and save default SEO metadata for any domains that are currently missing it.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
         <div className="space-y-4">
            <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
               <p>This tool will:</p>
               <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Scan all domains in the database.</li>
                  <li>Identify domains without entries in <code>domain_seo_settings</code>.</li>
                  <li>Generate titles, descriptions, and OpenGraph tags based on domain name and category.</li>
                  <li>Insert new records (skips existing ones).</li>
               </ul>
            </div>

            {!result ? (
               <Button onClick={handleRun} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                  Generate SEO Defaults
               </Button>
            ) : (
               <div className={`p-4 rounded-lg border flex items-start gap-3 ${result.success ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div>
                    <h4 className={`font-bold ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                      {result.success ? 'Operation Successful' : 'Operation Failed'}
                    </h4>
                    {result.success ? (
                      <p className="text-emerald-700 text-sm mt-1">
                         Successfully populated SEO data for <strong>{result.count}</strong> domains.
                      </p>
                    ) : (
                      <p className="text-red-600 text-sm mt-1">{error}</p>
                    )}
                    <Button variant="link" size="sm" className="px-0 mt-2 h-auto" onClick={() => setResult(null)}>
                       Run Again
                    </Button>
                  </div>
               </div>
            )}
         </div>
      </CardContent>
    </Card>
  );
};

export default DataMigrationSEO;
