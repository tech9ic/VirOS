import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import TaskBar from './TaskBar';
import { Position } from '../types';

const Desktop = () => {
  const { items, updateItemPosition, windows } = useStore();
  const [contextMenu, setContextMenu] = useState<{ show: boolean; position: Position }>({
    show: false,
    position: { x: 0, y: 0 },
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
      className="relative w-screen h-screen overflow-hidden" 
      ref={drop} 
      onContextMenu={handleContextMenu}
    >
      <div className="absolute inset-0 p-4">
        {items.map((item) => (
          <DesktopIcon key={item.id} item={item} />
        ))}
      </div>
      
      <WindowManager />
      
      <TaskBar />

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="absolute bg-white shadow-xl rounded z-50 text-sm py-1"
          style={{ 
            left: contextMenu.position.x, 
            top: contextMenu.position.y 
          }}
        >
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            New Folder
          </button>
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            New Text Document
          </button>
          <div className="border-t my-1"></div>
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            View
          </button>
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            Sort By
          </button>
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            Refresh
          </button>
          <div className="border-t my-1"></div>
          <button className="block w-full text-left px-4 py-1 hover:bg-blue-100">
            Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;