import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X } from '@phosphor-icons/react';

export default function SlidePanel({
  isOpen,
  onClose,
  title,
  children,
}) {
  const panelRef = useRef(null);
  const dragRef = useRef({
    startY: 0,
    currentY: 0,
    isDragging: false,
  });
  const [dragOffset, setDragOffset] = useState(0);

  // Handle drag start
  const handleDragStart = useCallback((e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragRef.current = {
      startY: clientY,
      currentY: clientY,
      isDragging: true,
    };
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e) => {
    if (!dragRef.current.isDragging) return;

    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - dragRef.current.startY;

    // Only allow dragging down
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragRef.current.isDragging) return;

    dragRef.current.isDragging = false;

    // If dragged more than 100px, close the panel
    if (dragOffset > 100) {
      onClose();
    }

    setDragOffset(0);
  }, [dragOffset, onClose]);

  // Add global event listeners for drag
  useEffect(() => {
    if (!isOpen) return;

    const handleMove = (e) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();

    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isOpen, handleDragMove, handleDragEnd]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const panelStyle = {
    transform: isOpen
      ? `translateY(${dragOffset}px)`
      : 'translateY(100%)',
    transition: dragRef.current.isDragging ? 'none' : undefined,
  };

  return (
    <div
      ref={panelRef}
      className={`slide-panel ${isOpen ? 'open' : ''}`}
      style={panelStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
    >
      {/* Drag handle */}
      <div
        className="panel-drag-handle"
        onTouchStart={handleDragStart}
        onMouseDown={handleDragStart}
      />

      {/* Header */}
      <div className="panel-header">
        <h2 id="panel-title" className="panel-title">{title}</h2>
        <button
          className="panel-close-btn"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}
