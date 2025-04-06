import React, { useState, useRef, useEffect } from 'react';
import { Window } from '../types';
import { useStore } from '../store';
import { XCircleIcon, MinusCircleIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react';

interface WindowProps {
  window: Window;
}

const WindowComponent: React.FC<WindowProps> = ({ window }) => {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  
  const windowRef = useRef<HTMLDivElement>(null);
  
  // If window is minimized, don't render the content
  if (window.isMinimized) {
    return null;
  }
  
  // Handle clicking on window to focus
  const handleWindowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusWindow(window.id);
  };
  
  // Start dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Don't drag if maximized
    if (window.isMaximized) return;
    
    focusWindow(window.id);
    setIsDragging(true);
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };
  
  // Start resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't resize if maximized
    if (window.isMaximized) return;
    
    focusWindow(window.id);
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({
      width: window.size.width,
      height: window.size.height,
    });
  };
  
  // Handle mouse movement for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateWindowPosition(
          window.id,
          e.clientX - dragOffset.x,
          e.clientY - dragOffset.y
        );
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStartPos.x;
        const deltaY = e.clientY - resizeStartPos.y;
        
        updateWindowSize(
          window.id,
          Math.max(300, resizeStartSize.width + deltaX),
          Math.max(200, resizeStartSize.height + deltaY)
        );
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStartPos, resizeStartSize, window.id]);
  
  return (
    <div
      ref={windowRef}
      className="os-window absolute pointer-events-auto"
      style={{
        width: window.isMaximized ? '100%' : window.size.width,
        height: window.isMaximized ? 'calc(100% - 40px)' : window.size.height,
        left: window.isMaximized ? 0 : window.position.x,
        top: window.isMaximized ? 0 : window.position.y,
        zIndex: window.zIndex,
      }}
      onClick={handleWindowClick}
    >
      <div className="os-window-title" onMouseDown={handleDragStart}>
        <span className="truncate">{window.title}</span>
        <div className="flex items-center space-x-1">
          <button
            className="text-white hover:bg-blue-800 p-1 rounded focus:outline-none"
            onClick={() => minimizeWindow(window.id)}
          >
            <MinusCircleIcon size={16} />
          </button>
          <button
            className="text-white hover:bg-blue-800 p-1 rounded focus:outline-none"
            onClick={() => 
              window.isMaximized 
                ? restoreWindow(window.id) 
                : maximizeWindow(window.id)
            }
          >
            {window.isMaximized ? (
              <MinimizeIcon size={16} />
            ) : (
              <MaximizeIcon size={16} />
            )}
          </button>
          <button
            className="text-white hover:bg-red-600 p-1 rounded focus:outline-none"
            onClick={() => closeWindow(window.id)}
          >
            <XCircleIcon size={16} />
          </button>
        </div>
      </div>
      
      <div className="os-window-content">
        {window.content}
      </div>
      
      {!window.isMaximized && (
        <div
          className="os-window-resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default WindowComponent;