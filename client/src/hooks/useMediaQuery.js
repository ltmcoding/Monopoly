import { useState, useEffect, useCallback } from 'react';

// Breakpoint values
export const breakpoints = {
  xs: 375,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Custom hook for responsive breakpoint detection
 * @param {string} query - Media query string (e.g., '(max-width: 768px)')
 * @returns {boolean} - Whether the media query matches
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e) => setMatches(e.matches);

    // Use addEventListener for modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  return matches;
};

/**
 * Hook that returns current breakpoint and helper booleans
 * @returns {Object} - { breakpoint, isMobile, isTablet, isDesktop, isLandscape }
 */
export const useBreakpoint = () => {
  const [state, setState] = useState(() => getBreakpointState());

  useEffect(() => {
    const handleResize = () => {
      setState(getBreakpointState());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
};

function getBreakpointState() {
  if (typeof window === 'undefined') {
    return {
      breakpoint: 'lg',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLandscape: true,
      width: 1024,
      height: 768,
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const isLandscape = width > height;

  let breakpoint = '2xl';
  if (width < breakpoints.xs) breakpoint = 'xs';
  else if (width < breakpoints.sm) breakpoint = 'sm';
  else if (width < breakpoints.md) breakpoint = 'md';
  else if (width < breakpoints.lg) breakpoint = 'lg';
  else if (width < breakpoints.xl) breakpoint = 'xl';

  // Mobile: < 768px (includes all phones and small tablets in portrait)
  const isMobile = width < breakpoints.md;

  // Tablet: 768px - 1280px
  const isTablet = width >= breakpoints.md && width < breakpoints.xl;

  // Desktop: >= 1280px
  const isDesktop = width >= breakpoints.xl;

  return {
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    width,
    height,
  };
}

export default useMediaQuery;
