import { 
  ShoppingCart, Send, MessageCircle, ExternalLink, Globe, CreditCard, Lock, DollarSign, Mail,
  // أيقونات أساسية وآمنة وتعمل على جميع الإصدارات
  Wallet, Banknote, ShieldCheck, Briefcase, Zap, Star, MessageSquare, Rocket, 
  TrendingUp, Award, Key, CheckCircle
} from 'lucide-react';

export const BUILT_IN_BUTTONS = [
  {
    id: 'buyNow',
    label: 'Buy Now',
    icon: 'ShoppingCart',
    color: 'emerald',
    hoverColor: 'emerald-700',
    action: 'buyNow', 
    description: 'Initiates the direct purchase flow via PayPal or primary gateway.',
    enabled: true,
    order: 0,
    type: 'built-in',
    isPrimary: true
  },
  {
    id: 'makeOffer',
    label: 'Make Offer',
    icon: 'Send',
    color: 'white',
    hoverColor: 'slate-50',
    borderColor: 'slate-200',
    textColor: 'slate-700',
    action: 'makeOffer', 
    description: 'Opens the Make Offer modal form.',
    enabled: true,
    order: 1,
    type: 'built-in',
    variant: 'outline'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: 'MessageCircle',
    color: 'green',
    backgroundColor: 'green-50',
    borderColor: 'green-200',
    textColor: 'green-700',
    hoverColor: 'green-100',
    action: 'chat', 
    description: 'Opens WhatsApp or primary chat application.',
    enabled: true,
    order: 2,
    type: 'built-in',
    variant: 'custom'
  },
  {
    id: 'buyViaGoDaddy',
    label: 'Buy via GoDaddy',
    icon: 'ExternalLink',
    color: 'yellow',
    backgroundColor: '#FFD700',
    hoverColor: '#E6C200',
    textColor: 'slate-900',
    borderColor: 'yellow-400/50',
    action: 'buyViaGoDaddy', 
    description: 'Redirects user to GoDaddy for sale page.',
    enabled: true,
    order: 3,
    type: 'built-in',
    variant: 'custom'
  },
  {
    id: 'buyViaUnstoppable',
    label: 'Buy via Unstoppable Domains',
    icon: 'Globe',
    color: 'blue',
    hoverColor: 'blue-700',
    action: 'buyViaUnstoppable',
    description: 'Link for Web3 domains (only shows if domain is unstoppable).',
    enabled: true,
    order: 4,
    type: 'built-in',
    isConditional: true
  }
];

export const AVAILABLE_ICONS = [
  // 💰 Finance & Sales (المالية والمبيعات)
  { value: 'Award', label: 'Premium Sale (Badge)', component: Award },
  { value: 'Wallet', label: 'Wallet / Crypto', component: Wallet },
  { value: 'Banknote', label: 'Cash / Banknote', component: Banknote },
  { value: 'CreditCard', label: 'Credit Card', component: CreditCard },
  { value: 'DollarSign', label: 'Dollar Sign', component: DollarSign },

  // 🤝 Negotiation & Communication (التفاوض والتواصل)
  { value: 'MessageSquare', label: 'Negotiate (Chat)', component: MessageSquare },
  { value: 'Send', label: 'Send Offer', component: Send },
  { value: 'MessageCircle', label: 'WhatsApp / Chat', component: MessageCircle },
  { value: 'Mail', label: 'Email', component: Mail },

  // 🛡️ Trust & Security (الثقة والأمان للاستحواذ)
  { value: 'ShieldCheck', label: 'Secure Transfer (Shield)', component: ShieldCheck },
  { value: 'Key', label: 'Safe / Escrow', component: Key },
  { value: 'CheckCircle', label: 'Certified / Verified', component: CheckCircle },
  { value: 'Lock', label: 'Lock (Standard)', component: Lock },

  // 🚀 Premium, Tech & Assets (التميز والأصول)
  { value: 'TrendingUp', label: 'Investment / Value', component: TrendingUp },
  { value: 'Briefcase', label: 'Corporate / Business', component: Briefcase },
  { value: 'Rocket', label: 'Fast Transfer / Launch', component: Rocket },
  { value: 'Star', label: 'Featured / Premium', component: Star },
  { value: 'Zap', label: 'Instant Action', component: Zap },
  { value: 'Globe', label: 'Web / Domain', component: Globe },
  
  // 🔗 General (عام)
  { value: 'ShoppingCart', label: 'Cart (Standard)', component: ShoppingCart },
  { value: 'ExternalLink', label: 'External Link', component: ExternalLink },
];

export const DEFAULT_PURCHASE_OPTIONS = {
  builtIn: BUILT_IN_BUTTONS,
  custom: []
};
