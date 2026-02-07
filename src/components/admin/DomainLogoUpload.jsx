
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { optimizeImage } from '@/utils/ImageOptimizer';

const DomainLogoUpload = ({ domainId, domainName, initialUrl, initialAlt, onSave }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialUrl || null);
  const [altText, setAltText] = useState(initialAlt || '');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    // Sync external changes (e.g. initial load)
    if (initialUrl) setPreview(initialUrl);
    if (initialAlt) setAltText(initialAlt);
  }, [initialUrl, initialAlt]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate size (2MB)
    if (selectedFile.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 2MB.",
      });
      return;
    }

    try {
      // Create local preview immediately
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      setFile(selectedFile);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to process file." });
    }
  };

  const handleRemove = async () => {
    setFile(null);
    setPreview(null);
    setAltText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Notify parent immediately if strictly removing an existing image
    if (initialUrl) {
      onSave({ logo_url: null, logo_alt_text: null, logo_uploaded_at: null });
    }
  };

  const handleUpload = async () => {
    // Nothing to upload logic
    if (!file && !preview && !initialUrl) return;
    
    // Just updating alt text logic
    if (!file && preview === initialUrl) {
      onSave({ logo_url: initialUrl, logo_alt_text: altText, logo_uploaded_at: new Date().toISOString() });
      toast({ title: "Updated", description: "Image details updated." });
      return;
    }

    setUploading(true);
    try {
      // 1. Optimize
      const { blob } = await optimizeImage(file);
      
      // 2. Upload to Supabase
      // Use domain name for folder structure if available, otherwise fall back to ID
      // This creates paths like: domain-logos/example.com/123456789.webp
      const folderName = domainName ? domainName.trim() : `domain-${domainId || 'temp'}`;
      const fileName = `${folderName}/${Date.now()}.webp`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('domain-logos')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/webp'
        });

      if (uploadError) throw uploadError;

      // 3. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('domain-logos')
        .getPublicUrl(fileName);

      console.log('Uploaded Logo URL:', publicUrl);

      // 4. Trigger Save
      onSave({ 
        logo_url: publicUrl, 
        logo_alt_text: altText, 
        logo_uploaded_at: new Date().toISOString() 
      });

      toast({ title: "Success", description: "Logo uploaded successfully." });
      setFile(null); // Reset file input

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Could not upload image.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-slate-700">Domain Logo</Label>
        {preview && (
          <Button variant="ghost" size="sm" onClick={handleRemove} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8">
            <Trash2 className="w-4 h-4 mr-1" /> Remove
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Preview Area */}
        <div className="shrink-0">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg border border-slate-200 overflow-hidden bg-white shadow-sm group">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="text-white hover:text-emerald-400">
                  <Upload className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
            >
              <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
              <span className="text-xs text-slate-500 font-medium">Click to upload</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp"
          />
        </div>

        {/* Inputs Area */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <Label className="text-xs font-bold text-slate-500 mb-1.5 block">Alt Text (Required for SEO)</Label>
            <Input 
              value={altText} 
              onChange={(e) => setAltText(e.target.value)} 
              placeholder="e.g. Modern logo for FinTech brand"
              className="bg-white"
            />
          </div>

          <div className="text-xs text-slate-400 space-y-1">
            <p>• Max size: 2MB</p>
            <p>• Formats: JPG, PNG, WebP</p>
            <p>• Recommended: 500x500px or larger</p>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={uploading || (!file && preview === initialUrl && altText === initialAlt)}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Optimizing & Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" /> {file ? 'Upload & Save' : 'Update Details'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DomainLogoUpload;
