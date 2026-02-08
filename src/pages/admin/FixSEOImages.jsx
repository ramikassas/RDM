
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Play, Database, ArrowLeft, Terminal } from 'lucide-react';
import { populateSEOImages } from '@/utils/populateSEOImages';
import { Link } from 'react-router-dom';
import Breadcrumbs from '@/components/Breadcrumbs';

const FixSEOImages = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const runFix = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);

    // Capture logs in real-time if we implemented a stream, 
    // but here we just wait for the batch process
    setLogs(['Starting process... please wait...']);
    
    try {
      const response = await populateSEOImages();
      setResult(response);
      setLogs(response.logs);
    } catch (error) {
      setLogs(prev => [...prev, `CRITICAL ERROR: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <Breadcrumbs items={[
        { label: 'Admin', path: '/admin' }, 
        { label: 'SEO Manager', path: '/admin/seo-manager' },
        { label: 'Fix Images', path: null }
      ]} />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Database className="w-8 h-8 text-emerald-600" />
          Populate SEO Images
        </h1>
        <p className="text-slate-500 max-w-2xl">
          This tool will iterate through all domains that have a logo, generate the correct Supabase Storage URL 
          (<code>.../domain-logos/domain.com/logo.png</code>), and update the <code>og_image_url</code> in the 
          SEO settings table. This fixes issues where social sharing images are broken or using placeholders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Migration Control</CardTitle>
          <CardDescription>Click below to start the batch update process.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
             <Button onClick={runFix} disabled={loading} size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">
               {loading ? (
                 <>Running...</>
               ) : (
                 <><Play className="w-4 h-4 mr-2" /> Start Population Process</>
               )}
             </Button>
             <Link to="/admin/seo-manager">
               <Button variant="outline">Cancel</Button>
             </Link>
          </div>

          {loading && (
             <div className="space-y-2">
                <Progress value={undefined} className="h-2" />
                <p className="text-xs text-slate-500 text-center">Processing domains...</p>
             </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                 {result.success ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
                 <div>
                    <h3 className={`font-bold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.success ? 'Process Completed Successfully' : 'Process Completed with Errors'}
                    </h3>
                    <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                      Updated {result.updated} domains. Found {result.errors.length} errors.
                    </p>
                 </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-950 border-slate-800 text-slate-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-sm font-mono">
            <Terminal className="w-4 h-4" /> Execution Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto font-mono text-xs space-y-1 p-2 bg-slate-900 rounded border border-slate-800">
             {logs.length === 0 ? (
               <span className="text-slate-600 italic">Waiting to start...</span>
             ) : (
               logs.map((log, i) => (
                 <div key={i} className="border-b border-slate-800/50 pb-0.5 mb-0.5 last:border-0">
                    <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                 </div>
               ))
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FixSEOImages;
