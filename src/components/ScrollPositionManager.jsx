
import { useLayoutEffect, useRef, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollPositionManager = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollPosRef = useRef(0);
  const lastPath = useRef(location.pathname);
  const isFirstRender = useRef(true);

  // 1. Handle Scroll Tracking
  // Track scroll position continuously to have the latest value when navigation occurs
  // We use a passive listener to avoid performance bottlenecks
  useEffect(() => {
    const handleScroll = () => {
      scrollPosRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Main Scroll Logic (Restoration & Reset)
  useLayoutEffect(() => {
    // CRITICAL: Disable browser's native scroll restoration immediately
    // This allows us to take full manual control
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const currentPath = location.pathname;
    
    // Check if this is a page reload
    // performance.navigation.type === 1 is deprecated but widely supported
    // performance.getEntriesByType("navigation")[0].type === 'reload' is the modern standard
    const navEntry = performance.getEntriesByType?.("navigation")?.[0];
    const isReload = (navEntry && navEntry.type === 'reload') || performance.navigation?.type === 1;

    // --- HANDLING INITIAL LOAD / REFRESH ---
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      if (isReload) {
        // Requirement: On refresh, ALWAYS scroll to top immediately
        // This MUST be synchronous to prevent visual jumping
        window.scrollTo(0, 0);
        
        // Reset stored position for this page to prevent stale restoration later
        try {
          sessionStorage.removeItem(`scroll_pos_${currentPath}`);
        } catch (e) { /* ignore */ }
        
        // Return early - we don't want to run navigation logic on a fresh reload
        return;
      }
      
      // If not a reload (e.g. fresh tab), continue to standard logic
    }

    // --- SAVE PREVIOUS POSITION ---
    // Save the scroll position of the PREVIOUS page before we handle the new one
    // Only save if the path has actually changed to avoid overwriting with 0 on re-renders
    if (lastPath.current !== currentPath) {
       const saveKey = `scroll_pos_${lastPath.current}`;
       const posToSave = scrollPosRef.current;
       try {
         sessionStorage.setItem(saveKey, posToSave.toString());
       } catch (e) {
         console.warn('Failed to save scroll position', e);
       }
    }

    // --- RESTORE OR RESET ---
    if (navType === 'POP') {
      // Back/Forward button pressed - try to restore
      const restoreKey = `scroll_pos_${currentPath}`;
      const savedPos = sessionStorage.getItem(restoreKey);
      
      if (savedPos !== null) {
        const y = parseInt(savedPos, 10);
        window.scrollTo(0, y);
      } else {
        // No saved position found, default to top
        window.scrollTo(0, 0);
      }
    } else {
      // PUSH (New Link) or REPLACE - always scroll to top
      window.scrollTo(0, 0);
    }
    
    // Update ref for next navigation
    lastPath.current = currentPath;
    
    // Reset internal scroll tracker to 0 (or restored value) for the new page
    // ensuring we don't carry over old scroll values if the listener hasn't fired yet
    scrollPosRef.current = window.scrollY;

  }, [location.pathname, navType]);

  return children;
};

export default ScrollPositionManager;
