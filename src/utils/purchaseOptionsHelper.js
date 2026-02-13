
import { BUILT_IN_BUTTONS, DEFAULT_PURCHASE_OPTIONS } from '@/config/PURCHASE_OPTIONS_BUTTONS';

/**
 * Merges domain-specific settings with default configuration.
 * Handles migration if structure changes.
 */
export const mergePurchaseOptions = (domainSettings) => {
  if (!domainSettings) {
    return JSON.parse(JSON.stringify(DEFAULT_PURCHASE_OPTIONS));
  }

  // Ensure structure exists
  const merged = {
    builtIn: [],
    custom: Array.isArray(domainSettings.custom) ? domainSettings.custom : []
  };

  // Merge Built-in buttons (preserve enabled state and order from DB, but keep code config for labels/actions)
  // This allows us to update code (e.g. change an icon) and have it reflect without DB migration, 
  // while keeping user's "enabled" preference.
  merged.builtIn = BUILT_IN_BUTTONS.map(defaultBtn => {
    const savedBtn = Array.isArray(domainSettings.builtIn) 
      ? domainSettings.builtIn.find(b => b.id === defaultBtn.id) 
      : null;

    if (savedBtn) {
      return {
        ...defaultBtn,
        enabled: savedBtn.enabled !== undefined ? savedBtn.enabled : defaultBtn.enabled,
        order: savedBtn.order !== undefined ? savedBtn.order : defaultBtn.order
      };
    }
    return defaultBtn;
  });

  return merged;
};

/**
 * Returns a flat, sorted list of all active buttons for the frontend renderer.
 */
export const getPurchaseOptionsButtons = (domain) => {
  // 1. Get merged config (database + defaults)
  // We use 'purchase_options_config' column as specified.
  // Assuming the DB schema has a JSONB column named 'purchase_options_config'.
  
  const config = mergePurchaseOptions(domain?.purchase_options_config);

  // 2. Combine lists
  let allButtons = [
    ...config.builtIn,
    ...config.custom
  ];

  // 3. Filter enabled
  // We filter out disabled buttons. 
  const enabledButtons = allButtons.filter(btn => btn.enabled);

  // 4. Sort by order
  enabledButtons.sort((a, b) => a.order - b.order);

  return enabledButtons;
};

/**
 * Validates a custom button object.
 */
export const validateButtonConfig = (button) => {
  if (!button.label || button.label.trim() === '') return { isValid: false, error: 'Label is required' };
  if (!button.url || button.url.trim() === '') return { isValid: false, error: 'URL is required' };
  return { isValid: true };
};
