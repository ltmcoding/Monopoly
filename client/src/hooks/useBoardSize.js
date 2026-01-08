import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for dynamic board sizing based on container dimensions
 * Uses ResizeObserver for efficient resize detection
 *
 * @param {Object} options
 * @param {number} options.minSize - Minimum board size (default: 280)
 * @param {number} options.maxSize - Maximum board size (default: 950)
 * @param {number} options.padding - Padding to subtract from available space (default: 16)
 * @returns {Object} - { size, containerRef }
 */
export const useBoardSize = ({
  minSize = 280,
  maxSize = 1200,
  padding = 16
} = {}) => {
  // Start with null to indicate "not yet calculated"
  const [size, setSize] = useState(null);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  const calculateSize = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Skip if container has no dimensions yet
    if (rect.width === 0 || rect.height === 0) return;

    // Use minimal padding to maximize board size
    const isMobile = window.innerWidth < 768;
    const effectivePadding = isMobile ? 4 : padding;

    // Get the actual available space
    const availableWidth = rect.width - effectivePadding;
    const availableHeight = rect.height - effectivePadding;

    // Board is square, so use the smaller dimension
    const availableSize = Math.min(availableWidth, availableHeight);

    // Clamp to min/max bounds - allow board to be as big as possible
    const clampedSize = Math.max(minSize, Math.min(maxSize, availableSize));
    const rounded = Math.round(clampedSize);

    // Always set the size (first calculation) or only update if changed
    setSize(prev => (prev === null || prev !== rounded) ? rounded : prev);
  }, [minSize, maxSize, padding]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial calculation
    calculateSize();

    // Set up ResizeObserver
    observerRef.current = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to batch updates
      window.requestAnimationFrame(() => {
        calculateSize();
      });
    });

    observerRef.current.observe(container);

    // Also listen for orientation changes on mobile
    const handleOrientationChange = () => {
      setTimeout(calculateSize, 100); // Small delay for orientation to settle
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [calculateSize]);

  return { size, containerRef };
};

export default useBoardSize;
