
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { populateDomainSEO } from '@/utils/populateDomainSEO';
import { Loader2, CheckCircle, AlertTriangle, Database } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';

const PopulateSEO = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRunMigration = async () => {
    setLoading(true);
    try {
      const res = await populateDomainSEO();
      setResult(res);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Breadcrumbs items={[{ label: 'Admin', path: '/admin' }, { label: 'Populate SEO', path: null }]} />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Database className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">SEO Data Migration</h1>
          <p className="text-slate-500">One-time setup utility</p>
        </div>
      </div>

      <Card className="border-t-4 border-t-purple-500 shadow-md">
        <CardHeader>
          <CardTitle>Populate Domain SEO Data</CardTitle>
          <CardDescription>
            This utility will scan all existing domains and generate default SEO metadata for any that are missing it.
            It is safe to run multiple times; it will skip domains that already have SEO settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-md text-sm text-slate-700 border border-slate-200">
            <p className="font-semibold mb-2">The following default values will be generated:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Page Title:</strong> [Domain Name] - Premium Domain for Sale</li>
              <li><strong>H1 Title:</strong> Redefining Digital Asset Acquisition</li>
              <li><strong>Description:</strong> Premium [Domain Name] domain available for purchase...</li>
              <li><strong>Canonical URL:</strong> https://rdm.bz/domain/[Domain Name]</li>
              <li><strong>Schema:</strong> Product JSON-LD</li>
            </ul>
          </div>

          {!result ? (
            <Button 
              onClick={handleRunMigration} 
              disabled={loading}
              size="lg"
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Domains...
                </>
              ) : (
                <>
                  Populate Domain SEO Data
                </>
              )}
            </Button>
          ) : (
            <div className={`p-6 rounded-lg border ${result.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${result.success ? 'text-emerald-800' : 'text-red-800'}`}>
                    {result.success ? "Migration Complete" : "Migration Failed"}
                  </h3>
                  <p className={`mt-1 ${result.success ? 'text-emerald-700' : 'text-red-700'}`}>
                    {result.message || result.error}
                  </p>
                  
                  {result.success && (
                    <div className="mt-4 pt-4 border-t border-emerald-200 text-sm text-emerald-800">
                      <p className="font-semibold">Verification:</p>
                      <p>Processed <strong>{result.count}</strong> domains successfully.</p>
                      <p className="mt-4 italic text-slate-500">
                        You may now remove this page and the utility function from the codebase as requested.
                      </p>
                    </div>
                  )}
                  
                  {!result.success && (
                    <Button 
                      variant="outline" 
                      className="mt-4 bg-white" 
                      onClick={() => setResult(null)}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PopulateSEO;
