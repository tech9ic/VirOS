import { useState, useEffect, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store';
import DesktopIcon from './DesktopIcon';
import WindowManager from './WindowManager';
import TerminalWindow from './TerminalWindow';
import { Position, DesktopItem } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { FolderIcon, FileTextIcon, TerminalIcon, SunIcon, MoonIcon } from 'lucide-react';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    itemToDelete?: string;
  }
}

const Desktop = () => {
  const { items, updateItemPosition, windows, logout, addItem, openWindow, user, theme, toggleTheme } = useStore();
  
  // Terminal content for opening from the top bar using the TerminalWindow component
  const terminalContent = (
    <TerminalWindow username={user?.username || 'guest'} />
  );
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
  
  // Format time in 24-hour format for more terminal-like feel
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  // Create a new folder
  const createNewFolder = useCallback(() => {
    const newFolder: DesktopItem = {
      id: uuidv4(),
      name: `Folder ${items.filter(item => item.type === 'folder').length + 1}`,
      type: 'folder',
      position: {
        // Position near context menu if it was triggered
        x: Math.max(10, Math.min(90, contextMenu.position.x / window.innerWidth * 100)),
        y: Math.max(10, Math.min(80, contextMenu.position.y / window.innerHeight * 100))
      },
      content: ''
    };
    
    addItem(newFolder);
    setContextMenu({ ...contextMenu, show: false });
  }, [addItem, contextMenu, items]);

  // Create a new text document
  const createNewTextDocument = useCallback(() => {
    const newDocument: DesktopItem = {
      id: uuidv4(),
      name: `Document ${items.filter(item => item.type === 'file').length + 1}.txt`,
      type: 'file',
      position: {
        // Position near context menu if it was triggered
        x: Math.max(10, Math.min(90, contextMenu.position.x / window.innerWidth * 100)),
        y: Math.max(10, Math.min(80, contextMenu.position.y / window.innerHeight * 100))
      },
      content: 'Edit this document...'
    };
    
    addItem(newDocument);
    setContextMenu({ ...contextMenu, show: false });
  }, [addItem, contextMenu, items]);

  // Setup drop target for desktop items with proper positioning
  const [, drop] = useDrop({
    accept: 'DESKTOP_ITEM',
    drop: (item: { id: string; type: string }, monitor) => {
      const dropResult = monitor.getDropResult();
      const delta = monitor.getDifferenceFromInitialOffset();
      
      if (!delta) return undefined;
      
      // Calculate position as percentage of viewport for responsive positioning
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get the current item to determine its current position
      const currentItem = items.find(i => i.id === item.id);
      if (!currentItem) return undefined;
      
      // Calculate new position in percentage
      const currentPosXPx = (currentItem.position.x / 100) * viewportWidth;
      const currentPosYPx = (currentItem.position.y / 100) * viewportHeight;
      
      const newPosXPx = currentPosXPx + delta.x;
      const newPosYPx = currentPosYPx + delta.y;
      
      const newPosX = (newPosXPx / viewportWidth) * 100;
      const newPosY = (newPosYPx / viewportHeight) * 100;
      
      // Ensure the icon stays within viewport bounds (with margins)
      const boundedPosX = Math.max(0, Math.min(90, newPosX));
      const boundedPosY = Math.max(8, Math.min(80, newPosY)); // Account for top bar
      
      updateItemPosition(item.id, boundedPosX, boundedPosY);
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
  
  // Handle file drag and drop from local computer
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault(); // Allow drop
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      
      if (e.dataTransfer?.files.length) {
        const files = Array.from(e.dataTransfer.files);
        
        // Process each dropped file
        files.forEach(file => {
          // Create a new desktop item for the dropped file
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const fileContent = event.target?.result as string || '';
            
            // Add the file to desktop items
            const newFile: DesktopItem = {
              id: uuidv4(),
              name: file.name,
              type: file.type.includes('image') ? 'image' : 'file',
              position: {
                // Position near drop location
                x: Math.max(10, Math.min(90, (e.clientX / window.innerWidth) * 100)),
                y: Math.max(10, Math.min(80, (e.clientY / window.innerHeight) * 100))
              },
              content: fileContent,
              fileType: file.type
            };
            
            addItem(newFile);
          };
          
          // Read file content as text or URL
          if (file.type.includes('image')) {
            reader.readAsDataURL(file);
          } else {
            reader.readAsText(file);
          }
        });
      }
    };

    const desktopEl = document.body;
    desktopEl.addEventListener('dragover', handleDragOver);
    desktopEl.addEventListener('drop', handleDrop);
    
    return () => {
      desktopEl.removeEventListener('dragover', handleDragOver);
      desktopEl.removeEventListener('drop', handleDrop);
    };
  }, [addItem]);

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
      className={`relative w-screen h-screen overflow-hidden font-mono ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
      ref={drop} 
      onContextMenu={handleContextMenu}
    >
      {/* Top status bar - only responds to left clicks */}
      <div 
        className={`absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-4 z-10 border-b ${theme === 'dark' ? 'bg-black border-zinc-800 text-white' : 'bg-white border-gray-200 text-black'}`}
        onContextMenu={(e) => e.preventDefault()} // Prevent right-click context menu
      >
        <div 
          className={`flex items-center text-xs cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          onClick={() => openWindow('Terminal', terminalContent)}
        >
          <TerminalIcon size={14} className="mr-1" strokeWidth={1} />
          <span className="opacity-70">_</span>
        </div>
        <div className={`flex items-center space-x-4 text-xs opacity-70 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
          <span>{formattedTime}</span>
          <button 
            onClick={toggleTheme}
            className={`p-1 rounded flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <SunIcon size={14} className="text-yellow-400" strokeWidth={1} />
            ) : (
              <MoonIcon size={14} className="text-blue-300" strokeWidth={1} />
            )}
          </button>
          <button 
            onClick={logout} 
            className={`px-2 py-1 rounded text-xs transition-colors ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="absolute inset-0 pt-8">
        {/* Desktop items */}
        <div className="absolute top-0 left-0 bottom-0 right-0 p-4">
          {items.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>
      </div>
      
      <WindowManager />

      {/* Context Menu - with functional buttons */}
      {contextMenu.show && (
        <div 
          className={`absolute shadow-xl z-50 text-xs py-1 ${
            theme === 'dark' 
            ? 'bg-black border border-zinc-800 text-white' 
            : 'bg-white border border-gray-200 text-black'
          }`}
          style={{ 
            left: contextMenu.position.x, 
            top: contextMenu.position.y 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className={`block w-full text-left px-4 py-2 transition-colors flex items-center ${
              theme === 'dark' 
              ? 'hover:bg-zinc-800' 
              : 'hover:bg-gray-100'
            }`}
            onClick={createNewFolder}
          >
            <FolderIcon size={12} className={`mr-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`} strokeWidth={1} />
            <span>New Folder</span>
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 transition-colors flex items-center ${
              theme === 'dark' 
              ? 'hover:bg-zinc-800' 
              : 'hover:bg-gray-100'
            }`}
            onClick={createNewTextDocument}
          >
            <FileTextIcon size={12} className={`mr-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`} strokeWidth={1} />
            <span>New Text Document</span>
          </button>
          <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}></div>
          <button className={`block w-full text-left px-4 py-2 transition-colors opacity-70 ${
            theme === 'dark' 
            ? 'hover:bg-zinc-800' 
            : 'hover:bg-gray-100'
          }`}>
            View
          </button>
          <button className={`block w-full text-left px-4 py-2 transition-colors opacity-70 ${
            theme === 'dark' 
            ? 'hover:bg-zinc-800' 
            : 'hover:bg-gray-100'
          }`}>
            Sort By
          </button>
          <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}></div>
          <button className={`block w-full text-left px-4 py-2 transition-colors opacity-70 ${
            theme === 'dark' 
            ? 'hover:bg-zinc-800' 
            : 'hover:bg-gray-100'
          }`}>
            Properties
          </button>
        </div>
      )}
    </div>
  );
};

export default Desktop;