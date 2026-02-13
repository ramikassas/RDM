
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AVAILABLE_ICONS } from '@/config/PURCHASE_OPTIONS_BUTTONS';
import { v4 as uuidv4 } from 'uuid'; // Fallback if not available, simple generator below

const generateId = () => Math.random().toString(36).substr(2, 9);

const PurchaseOptionsButtonForm = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    url: '',
    icon: 'ExternalLink',
    color: 'emerald', // simplified color selection for now
    enabled: true,
    type: 'custom',
    order: 99
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData(prev => ({ ...prev, id: generateId() }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.url.trim()) newErrors.url = 'URL is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 animate-in fade-in slide-in-from-top-2">
      <h3 className="font-semibold text-slate-900 mb-4">{initialData ? 'Edit Custom Button' : 'Add Custom Button'}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="btn-label">Label <span className="text-red-500">*</span></Label>
          <Input 
            id="btn-label" 
            value={formData.label} 
            onChange={(e) => handleChange('label', e.target.value)} 
            placeholder="e.g. Visit Portfolio"
            className={errors.label ? "border-red-500" : ""}
          />
          {errors.label && <p className="text-xs text-red-500">{errors.label}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="btn-icon">Icon</Label>
          <Select 
            value={formData.icon} 
            onValueChange={(val) => handleChange('icon', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Icon" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_ICONS.map(icon => (
                <SelectItem key={icon.value} value={icon.value}>
                  <div className="flex items-center gap-2">
                    <icon.component className="w-4 h-4" />
                    <span>{icon.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="btn-url">Target URL <span className="text-red-500">*</span></Label>
          <Input 
            id="btn-url" 
            value={formData.url} 
            onChange={(e) => handleChange('url', e.target.value)} 
            placeholder="https://example.com"
            className={errors.url ? "border-red-500" : ""}
          />
          {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
        </div>

        <div className="space-y-2">
           <Label>Button Color Style</Label>
           <Select 
            value={formData.color} 
            onValueChange={(val) => handleChange('color', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emerald">Green (Primary)</SelectItem>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="slate">Dark / Slate</SelectItem>
              <SelectItem value="outline">Outline (White)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <Switch 
            id="btn-enabled" 
            checked={formData.enabled}
            onCheckedChange={(val) => handleChange('enabled', val)}
          />
          <Label htmlFor="btn-enabled">Enabled</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} type="button">Cancel</Button>
        <Button onClick={handleSubmit} type="button">
          {initialData ? 'Update Button' : 'Add Button'}
        </Button>
      </div>
    </div>
  );
};

export default PurchaseOptionsButtonForm;
