
import React, { useState, useEffect } from 'react';
import { SOCIAL_MEDIA_PLATFORMS } from '@/config/SOCIAL_MEDIA_PLATFORMS';
import { validateSocialMediaUrl } from '@/utils/validateSocialMediaUrl';
import SocialMediaIconRenderer from '@/components/SocialMediaIconRenderer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SocialMediaLinkForm = ({ initialData, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    platform: 'Facebook',
    url: '',
    order: 0
  });
  
  const [validationState, setValidationState] = useState({
    isValid: false,
    formattedUrl: '',
    error: null
  });

  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        platform: initialData.platform || 'Facebook',
        url: initialData.url || '',
        order: initialData.order || 0
      });
    }
  }, [initialData]);

  // Real-time validation
  useEffect(() => {
    const result = validateSocialMediaUrl(formData.url, formData.platform);
    setValidationState(result);
  }, [formData.url, formData.platform]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (!validationState.isValid) {
      return;
    }

    onSave({
      ...formData,
      url: validationState.formattedUrl, // Save the clean, formatted URL
      icon_name: SOCIAL_MEDIA_PLATFORMS.find(p => p.name === formData.platform)?.icon?.name || 'FaGlobe'
    });
  };

  const selectedPlatformConfig = SOCIAL_MEDIA_PLATFORMS.find(p => p.name === formData.platform) || SOCIAL_MEDIA_PLATFORMS[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <div className="relative">
            <select
              id="platform"
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              {SOCIAL_MEDIA_PLATFORMS.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Selection */}
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>
      </div>

      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="url">Profile URL or Username</Label>
        <div className="relative">
          <div className="absolute left-3 top-2.5 text-slate-400">
            <SocialMediaIconRenderer platformName={formData.platform} className="w-5 h-5" />
          </div>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="pl-10"
            placeholder={selectedPlatformConfig.placeholder}
            onBlur={() => setTouched(true)}
          />
        </div>
        
        {/* Validation Feedback */}
        {formData.url && (
          <div className="mt-2 text-xs">
            {validationState.isValid ? (
              <div className="flex items-start gap-2 text-emerald-600 bg-emerald-50 p-2 rounded">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Valid formatted URL:</span>
                  <br />
                  <span className="font-mono text-[10px] break-all">{validationState.formattedUrl}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Invalid format</span>
                  <br />
                  {validationState.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving || (touched && !validationState.isValid)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Link
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SocialMediaLinkForm;
