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
  maxSize = 700,
  padding = 32
} = {}) => {
  const [size, setSize] = useState(maxSize);
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  const calculateSize = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();

    // Get the actual available space
    const availableWidth = rect.width - padding;
    const availableHeight = rect.height - padding;

    // Board is square, so use the smaller dimension
    const availableSize = Math.min(availableWidth, availableHeight);

    // Clamp to min/max bounds
    const clampedSize = Math.max(minSize, Math.min(maxSize, availableSize));

    // Only update if size actually changed (avoid unnecessary re-renders)
    setSize(prev => {
      const rounded = Math.round(clampedSize);
      return prev === rounded ? prev : rounded;
    });
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
