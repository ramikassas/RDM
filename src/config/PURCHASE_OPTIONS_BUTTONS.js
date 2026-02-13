
import { ShoppingCart, Send, MessageCircle, ExternalLink, Globe, CreditCard, Lock, DollarSign, Mail } from 'lucide-react';

export const BUILT_IN_BUTTONS = [
  {
    id: 'buyNow',
    label: 'Buy Now',
    icon: 'ShoppingCart',
    color: 'emerald',
    hoverColor: 'emerald-700',
    action: 'buyNow', // mapped to internal function
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
    action: 'makeOffer', // mapped to internal function
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
    action: 'chat', // mapped to internal function
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
    action: 'buyViaGoDaddy', // mapped to internal function
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
  { value: 'ShoppingCart', label: 'Cart', component: ShoppingCart },
  { value: 'Send', label: 'Send', component: Send },
  { value: 'MessageCircle', label: 'Chat', component: MessageCircle },
  { value: 'ExternalLink', label: 'External Link', component: ExternalLink },
  { value: 'Globe', label: 'Globe', component: Globe },
  { value: 'CreditCard', label: 'Credit Card', component: CreditCard },
  { value: 'Lock', label: 'Lock', component: Lock },
  { value: 'DollarSign', label: 'Dollar', component: DollarSign },
  { value: 'Mail', label: 'Mail', component: Mail },
];

export const DEFAULT_PURCHASE_OPTIONS = {
  builtIn: BUILT_IN_BUTTONS,
  custom: []
};
