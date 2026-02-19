import React from 'react';
import { ShoppingCart, Send, MessageCircle, ExternalLink, Globe, CreditCard, Lock, DollarSign, Mail, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AVAILABLE_ICONS } from '@/config/PURCHASE_OPTIONS_BUTTONS';

const IconRenderer = ({ name, className }) => {
  const iconDef = AVAILABLE_ICONS.find(i => i.value === name);
  const IconComp = iconDef ? iconDef.component : ExternalLink;
  return <IconComp className={className} />;
};

const PreviewButton = ({ config }) => {
  const isOutline = config.variant === 'outline' || config.color === 'outline';
  const isYellow = config.color === 'yellow';
  
  let buttonClasses = "w-full h-12 font-bold mb-3 flex items-center justify-center gap-2 transition-all";
  
  if (config.id === 'buyNow' || config.color === 'emerald') {
    buttonClasses += " bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200";
  } else if (config.id === 'makeOffer' || isOutline) {
    buttonClasses += " border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
  } else if (config.id === 'chat') {
    buttonClasses += " bg-green-50 border border-green-200 hover:bg-green-100 text-green-700";
  } else if (config.id === 'buyViaGoDaddy' || isYellow) {
    buttonClasses += " bg-[#FFD700] hover:bg-[#E6C200] text-slate-900 border border-yellow-400/50";
  } else if (config.color === 'blue') {
     buttonClasses += " bg-blue-600 hover:bg-blue-700 text-white";
  } else if (config.color === 'slate') {
     buttonClasses += " bg-slate-900 hover:bg-slate-800 text-white";
  } else if (config.color === 'red') {
     buttonClasses += " bg-red-500 hover:bg-red-600 text-white";
  } else if (config.color === 'orange') {
     buttonClasses += " bg-orange-500 hover:bg-orange-600 text-white";
  } else if (config.color === 'amber') {
     buttonClasses += " bg-amber-500 hover:bg-amber-600 text-white";
  } else if (config.color === 'indigo') {
     buttonClasses += " bg-indigo-500 hover:bg-indigo-600 text-white";
  } else if (config.color === 'purple') {
     buttonClasses += " bg-purple-500 hover:bg-purple-600 text-white";
  } else if (config.color === 'pink') {
     buttonClasses += " bg-pink-500 hover:bg-pink-600 text-white";
  } else if (config.color === 'gray') {
     buttonClasses += " bg-gray-200 hover:bg-gray-300 text-gray-900";
  } else if (config.color === 'ghost') {
     buttonClasses += " bg-transparent hover:bg-slate-100 text-slate-900";
  }

  if (!config.enabled) {
    buttonClasses += " opacity-40 grayscale cursor-not-allowed";
  }

  return (
    <div className="relative group">
       {!config.enabled && (
         <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow uppercase font-bold tracking-wider">Disabled</span>
         </div>
       )}
       <Button className={buttonClasses} disabled={!config.enabled}>
          <IconRenderer name={config.icon} className="w-4 h-4" />
          {config.label}
       </Button>
    </div>
  );
};

const PurchaseOptionsPreview = ({ buttons }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 max-w-sm mx-auto">
       <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 pb-4 border-b border-slate-50">
          <CreditCard className="w-5 h-5 text-emerald-600" /> Purchase Options
       </h3>
       
       <div className="space-y-1">
         {buttons.length === 0 ? (
           <div className="text-center py-8 text-slate-400 text-sm italic">
             No buttons enabled
           </div>
         ) : (
           buttons.map(btn => (
             <PreviewButton key={btn.id} config={btn} />
           ))
         )}
       </div>

       <div className="mt-6 pt-4 border-t border-slate-100 text-center">
         <p className="text-xs text-slate-400">Preview of sidebar widget</p>
       </div>
    </div>
  );
};

export default PurchaseOptionsPreview;
