'use client';

import { useCallback, useEffect, useRef } from 'react';

interface Props {
  side: 'left' | 'right';
  onResize: (delta: number) => void;
}

export default function ResizeHandle({ side, onResize }: Props) {
  const dragging = useRef(false);
  const startX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      startX.current = e.clientX;
      // For left sidebar: dragging right = wider (positive delta)
      // For right sidebar: dragging left = wider (negative delta)
      onResize(side === 'left' ? delta : -delta);
    };

    const handleMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize, side]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`w-[4px] cursor-col-resize hover:bg-[#d4d4d4] active:bg-[#808080] transition-colors flex-shrink-0 ${
        side === 'left' ? 'border-r border-[#ebebeb]' : 'border-l border-[#ebebeb]'
      }`}
    />
  );
}
