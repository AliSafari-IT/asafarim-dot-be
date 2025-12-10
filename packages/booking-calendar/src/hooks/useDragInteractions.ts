// packages/booking-calendar/src/hooks/useDragInteractions.ts
import { useState, useCallback } from 'react';

interface DragState {
  isDragging: boolean;
  draggedEventId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function useDragInteractions() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedEventId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleDragStart = useCallback((eventId: string, clientX: number, clientY: number) => {
    setDragState({
      isDragging: true,
      draggedEventId: eventId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    });
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    setDragState(prev => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
    }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedEventId: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
    });
  }, []);

  const getDragOffset = useCallback(() => {
    return {
      x: dragState.currentX - dragState.startX,
      y: dragState.currentY - dragState.startY,
    };
  }, [dragState]);

  return {
    dragState,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    getDragOffset,
  };
}