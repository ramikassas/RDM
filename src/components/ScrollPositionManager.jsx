
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollPositionManager = ({ children }) => {
  const location = useLocation();
  const navType = useNavigationType();
  const scrollYRef = useRef(0);
  const prevPathname = useRef(location.pathname);

  // Disable browser's automatic scroll restoration to avoid conflicts
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Use passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Save scroll position for the page we just left
    const saveKey = `scroll_position_${prevPathname.current}`;
    sessionStorage.setItem(saveKey, scrollYRef.current.toString());

    // Logic for restoring or resetting scroll
    if (navType === 'POP') {
      // Back/Forward navigation: Restore position
      const restoreKey = `scroll_position_${currentPath}`;
      const savedPosition = sessionStorage.getItem(restoreKey);

      if (savedPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(savedPosition, 10));
        }, 0);
      } else {
        // Fallback if no saved position exists
        window.scrollTo(0, 0);
      }
    } else {
      // PUSH or REPLACE: Scroll to top
      window.scrollTo(0, 0);
    }

    // Update reference to current path for next navigation
    prevPathname.current = currentPath;

  }, [location, navType]);

  return children;
};

export default ScrollPositionManager;
