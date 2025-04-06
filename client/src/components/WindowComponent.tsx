import React, { useState, useRef, useEffect } from 'react';
import { Window } from '../types';
import { useStore } from '../store';
import { XIcon, MinusIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react';

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
  }, [isDragging, isResizing, dragOffset, resizeStartPos, resizeStartSize, window.id, updateWindowPosition, updateWindowSize]);
  
  // Calculate if window is active based on zIndex
  const isActive = window.zIndex === Math.max(...useStore().windows.map(w => w.zIndex));
  
  return (
    <div
      ref={windowRef}
      className={`absolute font-mono pointer-events-auto border ${isActive ? 'border-zinc-600' : 'border-zinc-800'} shadow-md overflow-hidden`}
      style={{
        width: window.isMaximized ? 'calc(100% - 40px)' : window.size.width,
        height: window.isMaximized ? 'calc(100% - 50px)' : window.size.height,
        left: window.isMaximized ? 20 : window.position.x,
        top: window.isMaximized ? 10 : window.position.y,
        zIndex: window.zIndex,
        backgroundColor: 'black',
      }}
      onClick={handleWindowClick}
    >
      {/* Window title bar */}
      <div 
        className={`h-7 flex items-center justify-between px-2 ${isActive ? 'bg-zinc-800' : 'bg-zinc-900'} text-xs text-white cursor-move border-b border-zinc-700`}
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-zinc-600'}`}></div>
          <span className="truncate text-zinc-400">{window.title}</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="text-zinc-500 hover:text-white focus:outline-none transition-colors"
            onClick={() => minimizeWindow(window.id)}
          >
            <MinusIcon size={12} strokeWidth={1.5} />
          </button>
          <button
            className="text-zinc-500 hover:text-white focus:outline-none transition-colors"
            onClick={() => 
              window.isMaximized 
                ? restoreWindow(window.id) 
                : maximizeWindow(window.id)
            }
          >
            {window.isMaximized ? (
              <MinimizeIcon size={12} strokeWidth={1.5} />
            ) : (
              <MaximizeIcon size={12} strokeWidth={1.5} />
            )}
          </button>
          <button
            className="text-zinc-500 hover:text-white focus:outline-none transition-colors"
            onClick={() => closeWindow(window.id)}
          >
            <XIcon size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>
      
      {/* Window content */}
      <div className="text-white overflow-auto h-[calc(100%-1.75rem)]">
        {window.content}
      </div>
      
      {/* Resize handle - only show if window is not maximized */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-zinc-600"></div>
        </div>
      )}
    </div>
  );
};

export default WindowComponent;