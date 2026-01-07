import { useRef, useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for pinch-to-zoom and pan functionality
 *
 * @param {Object} options
 * @param {number} options.minScale - Minimum zoom scale (default: 0.5)
 * @param {number} options.maxScale - Maximum zoom scale (default: 3)
 * @param {Function} options.onZoomChange - Callback when zoom changes
 * @returns {Object} - { transform, handlers, resetZoom, isZoomed, setTransform }
 */
export const usePinchZoom = ({
  minScale = 0.5,
  maxScale = 3,
  onZoomChange
} = {}) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const gestureRef = useRef({
    initialDistance: 0,
    initialScale: 1,
    initialX: 0,
    initialY: 0,
    initialTouchX: 0,
    initialTouchY: 0,
    isPinching: false,
    isPanning: false,
  });

  const lastTapRef = useRef(0);
  const containerRef = useRef(null);

  // Calculate distance between two touch points
  const getDistance = useCallback((touches) => {
    if (touches.length < 2) return 0;
    const [t1, t2] = touches;
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  }, []);

  // Calculate midpoint between two touch points
  const getMidpoint = useCallback((touches) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    const [t1, t2] = touches;
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  }, []);

  // Constrain transform to bounds
  const constrainTransform = useCallback((newTransform) => {
    const { scale, x, y } = newTransform;

    // If zoomed out, center the content
    if (scale <= 1) {
      return { scale, x: 0, y: 0 };
    }

    // Calculate max pan based on scale
    const maxPan = ((scale - 1) / scale) * 50; // 50% of container

    return {
      scale,
      x: Math.max(-maxPan, Math.min(maxPan, x)),
      y: Math.max(-maxPan, Math.min(maxPan, y)),
    };
  }, []);

  const onTouchStart = useCallback((e) => {
    const gesture = gestureRef.current;

    if (e.touches.length === 2) {
      // Pinch start
      e.preventDefault();
      gesture.isPinching = true;
      gesture.isPanning = false;
      gesture.initialDistance = getDistance(e.touches);
      gesture.initialScale = transform.scale;
      gesture.initialX = transform.x;
      gesture.initialY = transform.y;
      setIsZooming(true);
    } else if (e.touches.length === 1 && transform.scale > 1) {
      // Pan start (only when zoomed in)
      gesture.isPanning = true;
      gesture.isPinching = false;
      gesture.initialTouchX = e.touches[0].clientX;
      gesture.initialTouchY = e.touches[0].clientY;
      gesture.initialX = transform.x;
      gesture.initialY = transform.y;
    }
  }, [transform, getDistance]);

  const onTouchMove = useCallback((e) => {
    const gesture = gestureRef.current;

    if (e.touches.length === 2 && gesture.isPinching) {
      // Pinch zoom
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const scaleDelta = currentDistance / gesture.initialDistance;
      const newScale = Math.min(maxScale, Math.max(minScale, gesture.initialScale * scaleDelta));

      const midpoint = getMidpoint(e.touches);

      setTransform(prev => constrainTransform({
        scale: newScale,
        x: gesture.initialX,
        y: gesture.initialY,
      }));
    } else if (e.touches.length === 1 && gesture.isPanning && transform.scale > 1) {
      // Pan
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = (touch.clientX - gesture.initialTouchX) / transform.scale;
      const deltaY = (touch.clientY - gesture.initialTouchY) / transform.scale;

      setTransform(prev => constrainTransform({
        scale: prev.scale,
        x: gesture.initialX + deltaX * 0.5,
        y: gesture.initialY + deltaY * 0.5,
      }));
    }
  }, [minScale, maxScale, transform.scale, getDistance, getMidpoint, constrainTransform]);

  const onTouchEnd = useCallback((e) => {
    const gesture = gestureRef.current;

    if (e.touches.length === 0) {
      gesture.isPinching = false;
      gesture.isPanning = false;
      setIsZooming(false);

      // Snap to 1x if close
      setTransform(prev => {
        if (prev.scale < 1.1 && prev.scale > 0.9) {
          return { scale: 1, x: 0, y: 0 };
        }
        return prev;
      });
    } else if (e.touches.length === 1) {
      // Switched from pinch to pan
      gesture.isPinching = false;
      gesture.isPanning = true;
      gesture.initialTouchX = e.touches[0].clientX;
      gesture.initialTouchY = e.touches[0].clientY;
      gesture.initialX = transform.x;
      gesture.initialY = transform.y;
    }
  }, [transform]);

  // Double tap to toggle zoom
  const onDoubleTap = useCallback((e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.preventDefault();

      if (transform.scale > 1) {
        // Reset zoom
        setTransform({ scale: 1, x: 0, y: 0 });
      } else {
        // Zoom to 2x centered on tap point
        setTransform({ scale: 2, x: 0, y: 0 });
      }
    }
    lastTapRef.current = now;
  }, [transform.scale]);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  // Notify on zoom change
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(transform);
    }
  }, [transform, onZoomChange]);

  return {
    transform,
    setTransform,
    isZooming,
    isZoomed: transform.scale !== 1,
    resetZoom,
    containerRef,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onClick: onDoubleTap,
    },
  };
};

export default usePinchZoom;
