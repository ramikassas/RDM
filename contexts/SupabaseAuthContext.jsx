// Duplicate file (should use src/contexts/SupabaseAuthContext.jsx). 
// Replacing with a re-export or empty file to prevent usage errors if imported by mistake.
// Best practice: Re-export the correct one to avoid breaking if something references it, 
// though we audited imports and they should point to src/.
export * from '@/contexts/SupabaseAuthContext';