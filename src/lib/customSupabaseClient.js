import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ahttbqbzhggfdqupfnus.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFodHRicWJ6aGdnZmRxdXBmbnVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzI4MTUsImV4cCI6MjA4MDAwODgxNX0.D6vXnMRxAW8uZExCVX7744I-WGn6qFQSmalMPZOHfMs';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
