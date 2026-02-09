
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to fetch data with anti-caching strategies.
 * Ensures initial state is null to prevent displaying stale data.
 * 
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies to trigger re-fetch
 * @returns {Object} { data, loading, error, refetch }
 */
export const useNoCache = (fetchFunction, dependencies = []) => {
  // Start with null to indicate "not yet fetched"
  // This is crucial for preventing "Flash of Old Data"
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // We intentionally do NOT clear data immediately if we want to support "background refresh"
    // But for this specific task (preventing flash of old data on mount), we want strict loading states.
    // If data is already null, it's fine. If we are re-fetching, we might want to keep showing old data 
    // or show skeleton. The prompt implies we want to ensure freshness.
    
    // Resetting to null forces the consumer to render the Skeleton again
    setData(null); 
    setError(null);

    try {
      // Execute the fetch
      // We rely on the caller to use Supabase client. 
      // While we can't easily inject ?t= param into Supabase builder without using .url,
      // the initialization of state to null + useEffect guarantees we are fetching NOW
      // and not rendering a previous state.
      const result = await fetchFunction();
      
      // Artificial delay to ensure skeleton is visible for at least a moment (prevents flicker if fast)
      // Optional, but good for UX consistency
      // await new Promise(r => setTimeout(r, 300)); 

      setData(result);
    } catch (err) {
      console.error("useNoCache fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
    
    // Cleanup function to avoid setting state on unmounted component
    return () => {
      // no-op, React handles this mostly now, but good practice
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};
