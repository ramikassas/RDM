
import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollPositionManager = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType(); // "POP", "PUSH", "REPLACE"
  const scrollYRef = useRef(0);
  const prevPathname = useRef(location.pathname);

  // 1. Disable browser's automatic scroll restoration
  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Track scroll position continuously
  useLayoutEffect(() => {
    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };
    
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Handle Navigation and Restoration
  useLayoutEffect(() => {
    const currentPath = location.pathname;
    
    // Save position for the page we are LEAVING
    // We use sessionStorage to persist across page reloads in same tab
    if (prevPathname.current) {
        const saveKey = `scroll_pos_${prevPathname.current}`;
        sessionStorage.setItem(saveKey, scrollYRef.current.toString());
    }

    // Handle Restoration Logic based on navigation type
    if (navType === 'POP') {
      // POP means Back/Forward button was pressed
      const restoreKey = `scroll_pos_${currentPath}`;
      const savedPosition = sessionStorage.getItem(restoreKey);

      if (savedPosition !== null) {
        const y = parseInt(savedPosition, 10);
        // Instant restore before paint
        window.scrollTo(0, y);
      } 
    } else {
      // PUSH or REPLACE means new navigation -> Scroll to top
      window.scrollTo(0, 0);
    }

    // Update ref for next navigation event
    prevPathname.current = currentPath;

  }, [location.pathname, navType]); // Dependency array ensures this runs on route change

  return children;
};

export default ScrollPositionManager;
