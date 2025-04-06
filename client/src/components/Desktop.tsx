import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import TaskBar from './TaskBar';
import { Position } from '../types';

const Desktop = () => {
  const { items, updateItemPosition, windows, logout } = useStore();
  const [contextMenu, setContextMenu] = useState<{ show: boolean; position: Position }>({
    show: false,
    position: { x: 0, y: 0 },
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Format time in 12-hour format
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });

  // Setup drop target for desktop items
  const [, drop] = useDrop({
    accept: 'DESKTOP_ITEM',
    drop: (item: { id: string }, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset() as {
        x: number;
        y: number;
      };
      const x = Math.round(delta.x);
      const y = Math.round(delta.y);
      
      updateItemPosition(item.id, x, y);
      return undefined;
    },
  });

  // Hide context menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.show) {
        setContextMenu({ ...contextMenu, show: false });
      }
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, [contextMenu]);

  // Show custom context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black font-mono" 
      ref={drop} 
      onContextMenu={handleContextMenu}
    >
      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black flex justify-between items-center px-4 z-10 border-b border-zinc-800">
        <div className="flex items-center text-white text-xs opacity-70">Terminal OS</div>
        <div className="flex items-center space-x-4 text-white text-xs opacity-70">
          <span>{formattedTime}</span>
          <button 
            onClick={logout} 
            className="px-2 py-1 rounded text-xs hover:bg-zinc-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="absolute inset-0 pt-8">
        {/* Desktop items in a more controlled grid, oklama-style */}
        <div className="absolute top-0 left-0 bottom-[40px] right-0 p-4">
          {items.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      <WindowManager />
      
      <TaskBar />

      {/* Context Menu - more minimal styling */}
      {contextMenu.show && (
        <div 
          className="absolute bg-black border border-zinc-800 shadow-xl z-50 text-xs py-1 text-white"
          style={{ 
            left: contextMenu.position.x, 
            top: contextMenu.position.y 
          }}
        >
          <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors">
            New Folder
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors">
            New Text Document
          </button>
          <div className="border-t border-zinc-800 my-1"></div>
          <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors">
            View
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors">
            Sort By
          </button>
          <div className="border-t border-zinc-800 my-1"></div>
          <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors">
            Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;