
import { useLayoutEffect, useRef, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollPositionManager = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType(); // "POP", "PUSH", "REPLACE"
  
  // Refs to track state without re-renders
  const scrollPosRef = useRef(0);
  const prevPathRef = useRef(location.pathname);
  const isRestoringRef = useRef(false);
  
  // Detect mobile to apply specific timing fixes if needed
  const isMobile = useRef(
    typeof navigator !== 'undefined' && 
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );

  // 1. CRITICAL: Disable browser's native scroll restoration immediately
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Debounced Scroll Listener
  // Uses requestAnimationFrame for optimal performance on mobile
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Only save position if we are NOT currently in the middle of a restoration logic
          // This prevents overwriting saved 'good' positions with '0' during page transitions
          if (!isRestoringRef.current) {
            scrollPosRef.current = window.scrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    // Passive listener for better scroll performance on touch devices
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Handle Navigation: Save & Restore
  useLayoutEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevPathRef.current;

    // --- SAVE LOGIC ---
    // If path has changed, save the LAST KNOWN scroll position for the PREVIOUS path
    if (prevPath !== currentPath) {
      try {
        const saveKey = `scroll_pos_${prevPath}`;
        // Use the ref value which tracks the last stable scroll position
        const posToSave = scrollPosRef.current;
        sessionStorage.setItem(saveKey, posToSave.toString());
        
        console.log(`[Scroll] Saved position ${posToSave} for ${prevPath}`);
      } catch (e) {
        // Fallback for private browsing or quota exceeded
        console.warn('[Scroll] Failed to save scroll position to sessionStorage', e);
      }
      
      // Update ref for next cycle
      prevPathRef.current = currentPath;
    }

    // --- RESTORE LOGIC ---
    if (navType === 'POP') {
      isRestoringRef.current = true;
      const restoreKey = `scroll_pos_${currentPath}`;
      
      try {
        const savedPos = sessionStorage.getItem(restoreKey);
        
        if (savedPos !== null) {
          const y = parseInt(savedPos, 10);
          console.log(`[Scroll] Restoring to ${y} for ${currentPath} (POP)`);
          
          // Attempt 1: Immediate (Synchronous before paint)
          window.scrollTo(0, y);
          
          // Attempt 2: Small delay for mobile/async rendering issues
          // This fixes the "scroll to bottom" or "clamped to top" issues if DOM wasn't fully ready
          if (isMobile.current) {
             setTimeout(() => {
                window.scrollTo(0, y);
                isRestoringRef.current = false;
             }, 50); // 50ms is usually imperceptible but allows layout to settle
          } else {
             isRestoringRef.current = false;
          }

        } else {
          console.log(`[Scroll] No saved position found for ${currentPath}`);
          isRestoringRef.current = false;
        }
      } catch (e) {
        console.error('[Scroll] Restore failed', e);
        isRestoringRef.current = false;
      }
    } else {
      // PUSH / REPLACE -> Scroll to top
      console.log(`[Scroll] Resetting to top for ${currentPath} (${navType})`);
      window.scrollTo(0, 0);
      
      // Reset internal ref so we start tracking from 0
      scrollPosRef.current = 0;
    }
  }, [location.pathname, navType]);

  return children;
};

export default ScrollPositionManager;
