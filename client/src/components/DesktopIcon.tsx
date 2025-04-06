import { useState, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { useStore } from '../store';
import { DesktopItem } from '../types';
import { FolderIcon, MonitorIcon, FileTextIcon, FileIcon, TrashIcon, TerminalIcon } from 'lucide-react';

interface DesktopIconProps {
  item: DesktopItem;
}

const DesktopIcon = ({ item }: DesktopIconProps) => {
  const { openWindow } = useStore();

  // Setup drag source with improved handle
  const [{ isDragging }, drag] = useDrag({
    type: 'DESKTOP_ITEM',
    item: () => ({ id: item.id, type: item.type }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Double click handler for opening windows with enhanced content
  const handleDoubleClick = () => {
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
                <div className="bg-zinc-900 p-3 mb-1 rounded-sm group-hover:bg-zinc-800 transition-colors">
                  <FolderIcon className="mx-auto" size={24} strokeWidth={1} />
                </div>
                <p className="text-xs truncate text-zinc-400 group-hover:text-white transition-colors">Documents</p>
              </div>
              <div className="text-center group cursor-pointer hover:opacity-80">
                <div className="bg-zinc-900 p-3 mb-1 rounded-sm group-hover:bg-zinc-800 transition-colors">
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
        return <TrashIcon size={28} className="text-white" strokeWidth={1} />;
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
  };

  // State for rename functionality
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateItemName } = useStore();
  
  // Handle right click for context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // We would implement a custom context menu for the icon here
    // For now, just toggle rename mode
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

  return (
    <div
      ref={drag}
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
      <div 
        className="rendering-pixelated w-16 h-16 flex items-center justify-center bg-zinc-900 rounded-sm border border-zinc-800 hover:border-zinc-700 transition-colors shadow-sm"
      >
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
  );
};

export default DesktopIcon;