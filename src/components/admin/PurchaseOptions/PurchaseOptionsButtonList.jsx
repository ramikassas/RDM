
import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, Edit, Trash2, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_ICONS } from '@/config/PURCHASE_OPTIONS_BUTTONS';
import { cn } from '@/lib/utils';

const IconRenderer = ({ name, className }) => {
  const iconDef = AVAILABLE_ICONS.find(i => i.value === name);
  const IconComp = iconDef ? iconDef.component : AVAILABLE_ICONS[0].component;
  return <IconComp className={className} />;
};

const DraggableItem = ({ item, onToggle, onEdit, onDelete }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="mb-2"
    >
      <div className={cn(
        "flex items-center justify-between p-3 rounded-lg border bg-white transition-all",
        item.enabled ? "border-slate-200 shadow-sm" : "border-slate-100 bg-slate-50 opacity-75"
      )}>
        <div className="flex items-center gap-3">
          <div 
            onPointerDown={(e) => controls.start(e)}
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 p-1"
          >
            <GripVertical className="h-5 w-5" />
          </div>

          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border",
            item.enabled 
              ? "bg-slate-100 border-slate-200 text-slate-600" 
              : "bg-slate-100 border-slate-100 text-slate-300"
          )}>
            <IconRenderer name={item.icon} className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">{item.label}</span>
              {item.type === 'built-in' ? (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-slate-100 text-slate-500">Built-in</Badge>
              ) : (
                 <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-blue-200 text-blue-600 bg-blue-50">Custom</Badge>
              )}
            </div>
            {item.description && <p className="text-xs text-slate-500 max-w-[250px] truncate">{item.description}</p>}
            {item.url && <p className="text-xs text-blue-500 max-w-[250px] truncate">{item.url}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-500 hidden sm:inline">{item.enabled ? 'Active' : 'Inactive'}</span>
             <Switch 
                checked={item.enabled}
                onCheckedChange={() => onToggle(item.id, item.type)}
             />
          </div>

          <div className="flex items-center gap-1 border-l pl-4 border-slate-100">
             {item.type === 'custom' && (
                <>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
             )}
             {item.type === 'built-in' && (
                <div title="Built-in buttons cannot be deleted, only disabled">
                    <Lock className="h-4 w-4 text-slate-300" />
                </div>
             )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

const PurchaseOptionsButtonList = ({ items, onReorder, onToggle, onEdit, onDelete }) => {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="space-y-2 mt-4">
      {items.map(item => (
        <DraggableItem 
          key={item.id} 
          item={item} 
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Reorder.Group>
  );
};

export default PurchaseOptionsButtonList;
