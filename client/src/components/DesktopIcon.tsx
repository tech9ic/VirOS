import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from '../store';
import { DesktopItem } from '../types';
import { FolderIcon, MonitorIcon, FileTextIcon, FileIcon, TrashIcon, TerminalIcon, Edit3Icon, Trash2Icon } from 'lucide-react';

interface DesktopIconProps {
  item: DesktopItem;
}

// For context menu
interface ContextMenuState {
  show: boolean;
  position: { x: number; y: number };
}

const DesktopIcon = ({ item }: DesktopIconProps) => {
  const { openWindow, removeItem } = useStore();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ show: false, position: { x: 0, y: 0 } });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Setup drag source with improved handle
  const [{ isDragging }, drag] = useDrag({
    type: 'DESKTOP_ITEM',
    item: () => ({ id: item.id, type: item.type }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Setup drop target for trash icon
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'DESKTOP_ITEM',
    drop: (droppedItem: { id: string, type: string }) => {
      if (item.type === 'trash' && droppedItem.id !== item.id) {
        // Show delete confirmation popup
        setShowDeleteConfirm(true);
        // Store the ID to delete in a window variable 
        window.itemToDelete = droppedItem.id;
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver() && item.type === 'trash',
    }),
  }), [item.type]);

  // Combine refs for both drag and drop when it's the trash icon
  const attachRef = (el: HTMLDivElement) => {
    drag(el);
    if (item.type === 'trash') {
      drop(el);
    }
  };

  // Double click handler for opening windows with enhanced content
  const handleDoubleClick = () => {
    if (item.type === 'trash') {
      // Show trash contents
      const content = (
        <div className="p-4 font-mono text-white bg-black h-full">
          <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium">Recycle Bin</h3>
            <span className="text-xs text-zinc-500">0 items</span>
          </div>
          <div className="flex items-center justify-center h-32 text-zinc-600">
            <p className="text-xs">Recycle Bin is empty</p>
          </div>
        </div>
      );
      openWindow(item.name, content);
      return;
    }
    
    let content;
    
    switch (item.type) {
      case 'folder':
        content = (
          <div className="p-4 font-mono text-white bg-black h-full">
            <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">{item.name}</h3>
              <span className="text-xs text-zinc-500">2 items</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {/* Folder content with interactive hover */}
              <div className="text-center group cursor-pointer hover:opacity-80">
                <div className="p-3 mb-1 rounded-sm">
                  <FolderIcon className="mx-auto" size={24} strokeWidth={1} />
                </div>
                <p className="text-xs truncate text-zinc-400 group-hover:text-white transition-colors">Documents</p>
              </div>
              <div className="text-center group cursor-pointer hover:opacity-80">
                <div className="p-3 mb-1 rounded-sm">
                  <FileTextIcon className="mx-auto" size={24} strokeWidth={1} />
                </div>
                <p className="text-xs truncate text-zinc-400 group-hover:text-white transition-colors">File.txt</p>
              </div>
            </div>
          </div>
        );
        break;
      case 'computer':
        content = (
          <div className="p-4 font-mono text-white bg-black h-full">
            <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">System</h3>
              <span className="text-xs text-zinc-500">2 drives</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-zinc-800 rounded-sm hover:bg-zinc-900 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FolderIcon size={20} strokeWidth={1} />
                  <div>
                    <p className="text-xs font-medium">System Drive</p>
                    <p className="text-xs text-zinc-500">80 GB</p>
                  </div>
                </div>
              </div>
              <div className="p-3 border border-zinc-800 rounded-sm hover:bg-zinc-900 cursor-pointer transition-colors">
                <div className="flex items-center space-x-3">
                  <FolderIcon size={20} strokeWidth={1} />
                  <div>
                    <p className="text-xs font-medium">Storage</p>
                    <p className="text-xs text-zinc-500">120 GB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case 'file':
        content = (
          <div className="p-4 font-mono text-white bg-black h-full">
            <div className="border-b border-zinc-800 pb-2 mb-4">
              <h3 className="text-sm font-medium">{item.name}</h3>
            </div>
            <div className="relative h-64 border border-zinc-800 p-3">
              <textarea 
                className="bg-transparent w-full h-full text-xs text-zinc-400 focus:outline-none resize-none"
                defaultValue={item.content || "Empty file. Start typing..."}
              ></textarea>
            </div>
          </div>
        );
        break;
      case 'terminal':
        content = (
          <div className="p-4 font-mono text-white bg-black h-full flex flex-col">
            <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">Terminal</h3>
            </div>
            <div className="flex-1 bg-zinc-900 p-2 overflow-y-auto font-mono text-xs text-green-500">
              <div className="mb-1">Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
              <div className="mb-1">Terminal OS [Version 1.0.0]</div>
              <div className="mb-3">(c) 2025 Terminal Corporation. All rights reserved.</div>
              <div className="flex items-start mb-1">
                <span className="mr-2 text-white">user@terminal:~$</span>
                <span className="inline-block animate-blink">▌</span>
              </div>
            </div>
          </div>
        );
        break;
      default:
        content = (
          <div className="p-4 font-mono text-white bg-black h-full">
            <div className="border-b border-zinc-800 pb-2 mb-4">
              <h3 className="text-sm font-medium">{item.name}</h3>
            </div>
            {item.content && <p className="text-xs text-zinc-400">{item.content}</p>}
            {!item.content && (
              <div className="flex items-center justify-center h-32 text-zinc-600">
                <p className="text-xs">No content available</p>
              </div>
            )}
          </div>
        );
    }
    
    openWindow(item.name, content);
  };

  // Render icon based on item type with minimal styling
  const renderIcon = () => {
    switch(item.type) {
      case 'folder':
        return <FolderIcon size={28} className="text-white" strokeWidth={1} />;
      case 'computer':
        return <MonitorIcon size={28} className="text-white" strokeWidth={1} />;
      case 'file':
        return <FileTextIcon size={28} className="text-white" strokeWidth={1} />;
      case 'trash':
        return <TrashIcon size={28} className={isOver ? "text-red-400" : "text-white"} strokeWidth={1} />;
      case 'terminal':
        return <TerminalIcon size={28} className="text-white" strokeWidth={1} />;
      case 'app':
        return <FileIcon size={28} className="text-white" strokeWidth={1} />;
      default:
        return <FileIcon size={28} className="text-white" strokeWidth={1} />;
    }
  };

  // Ensure icon has a position even for new items
  const position = !item.position ? { x: 20, y: 20 } : item.position;

  // Handle both click and touch events for better mobile support
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Hide context menu when clicking anywhere
    if (contextMenu.show) {
      setContextMenu({ ...contextMenu, show: false });
    }
  };

  // State for rename functionality
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateItemName } = useStore();
  
  // Handle right click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    if (item.type === 'trash' || item.type === 'computer') {
      return; // Don't show context menu for trash or computer
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Show custom context menu
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };
  
  // Handle rename when Enter is pressed or input loses focus
  const handleRename = (e: React.KeyboardEvent | React.FocusEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') {
      return;
    }
    
    if (newName.trim() && newName !== item.name) {
      updateItemName(item.id, newName.trim());
    }
    setIsRenaming(false);
  };
  
  // Handle context menu actions
  const handleOpenAction = () => {
    setContextMenu({ ...contextMenu, show: false });
    handleDoubleClick();
  };

  const handleRenameAction = () => {
    setContextMenu({ ...contextMenu, show: false });
    setIsRenaming(true);
    setNewName(item.name);
    // Focus the input after rendering
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  };

  const handleDeleteAction = () => {
    setContextMenu({ ...contextMenu, show: false });
    setShowDeleteConfirm(true);
    window.itemToDelete = item.id;
  };
  
  const confirmDelete = () => {
    if (window.itemToDelete) {
      removeItem(window.itemToDelete);
      window.itemToDelete = undefined;
    }
    setShowDeleteConfirm(false);
  };
  
  const cancelDelete = () => {
    window.itemToDelete = undefined;
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        ref={attachRef}
        className="flex flex-col items-center justify-center absolute text-sm cursor-grab"
        style={{
          opacity: isDragging ? 0.5 : 1,
          top: `${position.y}%`,
          left: `${position.x}%`,
          width: '90px',
          zIndex: isDragging ? 100 : 1,
          WebkitTouchCallout: 'none',
          transition: isDragging ? 'none' : 'opacity 0.2s ease',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
      >
        {/* Removed background frame, keeping only the icon */}
        <div className="flex items-center justify-center p-2 hover:opacity-80 transition-opacity">
          {renderIcon()}
        </div>
        {isRenaming ? (
          <input
            ref={inputRef}
            type="text"
            className="max-w-full text-center text-white bg-black border border-zinc-600 px-1 py-0.5 text-xs mt-1 focus:outline-none"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRename}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="max-w-full text-center text-white bg-black bg-opacity-80 px-1 py-0.5 text-xs mt-1 truncate">
            {item.name}
          </span>
        )}
      </div>
      
      {/* Context menu for this icon */}
      {contextMenu.show && (
        <div 
          className="fixed bg-black border border-zinc-800 shadow-xl z-50 text-xs py-1 text-white"
          style={{ 
            left: contextMenu.position.x, 
            top: contextMenu.position.y 
          }}
        >
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors flex items-center"
            onClick={handleOpenAction}
          >
            <FileIcon size={12} className="mr-2 text-zinc-400" strokeWidth={1} />
            <span>Open</span>
          </button>
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors flex items-center"
            onClick={handleRenameAction}
          >
            <Edit3Icon size={12} className="mr-2 text-zinc-400" strokeWidth={1} />
            <span>Rename</span>
          </button>
          <div className="border-t border-zinc-800 my-1"></div>
          <button 
            className="block w-full text-left px-4 py-2 hover:bg-zinc-800 transition-colors flex items-center text-red-400"
            onClick={handleDeleteAction}
          >
            <Trash2Icon size={12} className="mr-2" strokeWidth={1} />
            <span>Delete</span>
          </button>
        </div>
      )}
      
      {/* Delete confirmation popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-black border border-zinc-800 p-4 rounded-sm shadow-lg w-80">
            <h3 className="text-sm font-medium text-white mb-3">Confirm Delete</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Are you sure you want to move this item to the Recycle Bin?
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                className="px-3 py-1 text-xs border border-zinc-700 hover:bg-zinc-800 text-white transition-colors"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 text-white transition-colors"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DesktopIcon;