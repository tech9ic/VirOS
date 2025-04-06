import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { useStore } from '../store';
import { DesktopItem } from '../types';
import { FolderIcon, MonitorIcon, FileTextIcon, FileIcon, TrashIcon, TerminalIcon, Edit3Icon, Trash2Icon, ImageIcon } from 'lucide-react';
import TerminalWindow from './TerminalWindow';

interface DesktopIconProps {
  item: DesktopItem;
}

// For context menu
interface ContextMenuState {
  show: boolean;
  position: { x: number; y: number };
}

const DesktopIcon = ({ item }: DesktopIconProps) => {
  const { openWindow, removeItem, theme } = useStore();
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
      // Show buffer contents
      const bufferItems = useStore.getState().getBufferItems();
      
      const bufferContent = bufferItems.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {bufferItems.map((bufferItem) => (
            <div 
              key={bufferItem.id} 
              className="flex flex-col items-center p-2 hover:bg-zinc-900 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-center p-2">
                {bufferItem.type === 'folder' && <FolderIcon size={24} className="text-white" strokeWidth={1} />}
                {bufferItem.type === 'file' && <FileTextIcon size={24} className="text-white" strokeWidth={1} />}
                {bufferItem.type === 'image' && <ImageIcon size={24} className="text-white" strokeWidth={1} />}
              </div>
              <span className="text-xs text-center text-white bg-black bg-opacity-80 px-1 py-0.5 max-w-full truncate">
                {bufferItem.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-zinc-600">
          <p className="text-xs">Buffer is empty</p>
        </div>
      );
      
      const content = (
        <div className="p-4 font-mono text-white bg-black h-full">
          <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
            <h3 className="text-sm font-medium">Buffer</h3>
            <span className="text-xs text-zinc-500">{bufferItems.length} items</span>
          </div>
          <div className="flex flex-col">
            {bufferItems.length > 0 && (
              <div className="flex justify-end mb-4">
                <button 
                  className="px-3 py-1 text-xs bg-red-800 hover:bg-red-700 text-white transition-colors flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    useStore.getState().emptyBuffer();
                    
                    // Close and reopen the window to refresh content
                    const windows = useStore.getState().windows;
                    const bufferWindow = windows.find(w => w.title === 'Buffer');
                    if (bufferWindow) {
                      useStore.getState().closeWindow(bufferWindow.id);
                      // Re-open empty buffer
                      setTimeout(() => handleDoubleClick(), 100);
                    }
                  }}
                >
                  <TrashIcon size={12} className="mr-2" strokeWidth={1} />
                  Empty Buffer
                </button>
              </div>
            )}
            
            {bufferContent}
          </div>
        </div>
      );
      openWindow(item.name, content);
      return;
    }
    
    let content;
    
    switch (item.type) {
      case 'folder':
        // Get items in this folder
        const folderItems = useStore.getState().getItemsByParentId(item.id);
        const folderContent = folderItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-4">
            {folderItems.map((folderItem) => (
              <div 
                key={folderItem.id} 
                className="flex flex-col items-center p-2 hover:bg-zinc-900 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open the item within the folder
                  let subContent;
                  if (folderItem.type === 'file') {
                    subContent = (
                      <div className="p-4 font-mono text-white bg-black h-full">
                        <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
                          <h3 className="text-sm font-medium">{folderItem.name}</h3>
                          <button 
                            className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              const textarea = document.querySelector(`#file-${folderItem.id}`) as HTMLTextAreaElement;
                              if (textarea) {
                                useStore.getState().updateItemContent(folderItem.id, textarea.value);
                                alert('File saved successfully!');
                              }
                            }}
                          >
                            Save
                          </button>
                        </div>
                        <div className="relative h-64 border border-zinc-800 p-3">
                          <textarea 
                            id={`file-${folderItem.id}`}
                            className="bg-transparent w-full h-full text-xs text-zinc-400 focus:outline-none resize-none"
                            defaultValue={folderItem.content || "Empty file. Start typing..."}
                          ></textarea>
                        </div>
                      </div>
                    );
                  } else if (folderItem.type === 'image') {
                    subContent = (
                      <div className="p-4 font-mono text-white bg-black h-full flex flex-col">
                        <div className="border-b border-zinc-800 pb-2 mb-4">
                          <h3 className="text-sm font-medium">{folderItem.name}</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center bg-zinc-900 p-2 overflow-auto">
                          {folderItem.content ? (
                            <img 
                              src={folderItem.content} 
                              alt={folderItem.name} 
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <div className="text-zinc-500 text-xs">No image data available</div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    subContent = (
                      <div className="p-4 font-mono text-white bg-black h-full">
                        <div className="border-b border-zinc-800 pb-2 mb-4">
                          <h3 className="text-sm font-medium">{folderItem.name}</h3>
                        </div>
                        {folderItem.content && <p className="text-xs text-zinc-400">{folderItem.content}</p>}
                        {!folderItem.content && (
                          <div className="flex items-center justify-center h-32 text-zinc-600">
                            <p className="text-xs">No content available</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  useStore.getState().openWindow(folderItem.name, subContent);
                }}
              >
                <div className="flex items-center justify-center p-2">
                  {folderItem.type === 'folder' && <FolderIcon size={24} className="text-white" strokeWidth={1} />}
                  {folderItem.type === 'file' && <FileTextIcon size={24} className="text-white" strokeWidth={1} />}
                  {folderItem.type === 'image' && <ImageIcon size={24} className="text-white" strokeWidth={1} />}
                </div>
                <span className="text-xs text-center text-white bg-black bg-opacity-80 px-1 py-0.5 max-w-full truncate">
                  {folderItem.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-zinc-600">
            <p className="text-xs">Folder is empty</p>
          </div>
        );
        
        content = (
          <div className="p-4 font-mono text-white bg-black h-full">
            <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">{item.name}</h3>
              <span className="text-xs text-zinc-500">{folderItems.length} items</span>
            </div>
            <div className="flex flex-col">
              {/* Add new folder/file buttons for folder view */}
              <div className="flex space-x-2 mb-4">
                <button 
                  className="px-3 py-1 text-xs border border-zinc-800 hover:bg-zinc-800 text-white transition-colors flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFolderId = useStore.getState().addItemToFolder({
                      name: `Folder ${folderItems.filter(item => item.type === 'folder').length + 1}`,
                      type: 'folder',
                      position: { x: 20, y: 20 },
                      content: ''
                    }, item.id);
                  }}
                >
                  <FolderIcon size={12} className="mr-2" strokeWidth={1} />
                  New Folder
                </button>
                <button 
                  className="px-3 py-1 text-xs border border-zinc-800 hover:bg-zinc-800 text-white transition-colors flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newFileId = useStore.getState().addItemToFolder({
                      name: `Document ${folderItems.filter(item => item.type === 'file').length + 1}.txt`,
                      type: 'file',
                      position: { x: 20, y: 20 },
                      content: 'Edit this document...'
                    }, item.id);
                  }}
                >
                  <FileTextIcon size={12} className="mr-2" strokeWidth={1} />
                  New File
                </button>
              </div>
              {folderContent}
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
            <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">{item.name}</h3>
              <button 
                className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-600 text-white rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const textarea = document.querySelector(`#file-${item.id}`) as HTMLTextAreaElement;
                  if (textarea) {
                    useStore.getState().updateItemContent(item.id, textarea.value);
                    alert('File saved successfully!');
                  }
                }}
              >
                Save
              </button>
            </div>
            <div className="relative h-64 border border-zinc-800 p-3">
              <textarea 
                id={`file-${item.id}`}
                className="bg-transparent w-full h-full text-xs text-zinc-400 focus:outline-none resize-none"
                defaultValue={item.content || "Empty file. Start typing..."}
              ></textarea>
            </div>
          </div>
        );
        break;
      case 'image':
        content = (
          <div className="p-4 font-mono text-white bg-black h-full flex flex-col">
            <div className="border-b border-zinc-800 pb-2 mb-4">
              <h3 className="text-sm font-medium">{item.name}</h3>
            </div>
            <div className="flex-1 flex items-center justify-center bg-zinc-900 p-2 overflow-auto">
              {item.content ? (
                <img 
                  src={item.content} 
                  alt={item.name} 
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-zinc-500 text-xs">No image data available</div>
              )}
            </div>
          </div>
        );
        break;

      case 'terminal':
        content = (
          <TerminalWindow username={useStore.getState().user?.username || 'guest'} />
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
    const iconColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
    
    switch(item.type) {
      case 'folder':
        return <FolderIcon size={28} className={iconColor} strokeWidth={1} />;
      case 'computer':
        return <MonitorIcon size={28} className={iconColor} strokeWidth={1} />;
      case 'file':
        return <FileTextIcon size={28} className={iconColor} strokeWidth={1} />;
      case 'image':
        return <ImageIcon size={28} className={iconColor} strokeWidth={1} />;
      case 'trash':
        return <TrashIcon size={28} className={isOver ? "text-red-400" : iconColor} strokeWidth={1} />;
      case 'terminal':
        return <TerminalIcon size={28} className={iconColor} strokeWidth={1} />;
      case 'app':
        return <FileIcon size={28} className={iconColor} strokeWidth={1} />;
      default:
        return <FileIcon size={28} className={iconColor} strokeWidth={1} />;
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
      // Move to buffer instead of permanent delete
      useStore.getState().moveToBuffer(window.itemToDelete);
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
            className={`max-w-full text-center px-1 py-0.5 text-xs mt-1 focus:outline-none ${
              theme === 'dark' 
              ? 'text-white bg-black border border-zinc-600' 
              : 'text-black bg-white border border-gray-300'
            }`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleRename}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`max-w-full text-center px-1 py-0.5 text-xs mt-1 truncate ${
            theme === 'dark'
            ? 'text-white bg-black bg-opacity-80' 
            : 'text-black bg-white bg-opacity-80'
          }`}>
            {item.name}
          </span>
        )}
      </div>
      
      {/* Context menu for this icon */}
      {contextMenu.show && (
        <div 
          className={`fixed shadow-xl z-50 text-xs py-1 ${
            theme === 'dark'
            ? 'bg-black border border-zinc-800 text-white'
            : 'bg-white border border-gray-200 text-black'
          }`}
          style={{ 
            left: contextMenu.position.x, 
            top: contextMenu.position.y 
          }}
        >
          <button 
            className={`block w-full text-left px-4 py-2 transition-colors flex items-center ${
              theme === 'dark' 
              ? 'hover:bg-zinc-800' 
              : 'hover:bg-gray-100'
            }`}
            onClick={handleOpenAction}
          >
            <FileIcon size={12} className={`mr-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} strokeWidth={1} />
            <span>Open</span>
          </button>
          <button 
            className={`block w-full text-left px-4 py-2 transition-colors flex items-center ${
              theme === 'dark' 
              ? 'hover:bg-zinc-800' 
              : 'hover:bg-gray-100'
            }`}
            onClick={handleRenameAction}
          >
            <Edit3Icon size={12} className={`mr-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`} strokeWidth={1} />
            <span>Rename</span>
          </button>
          <div className={`border-t my-1 ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}></div>
          <button 
            className={`block w-full text-left px-4 py-2 transition-colors flex items-center text-red-500 ${
              theme === 'dark' 
              ? 'hover:bg-zinc-800' 
              : 'hover:bg-gray-100'
            }`}
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
          <div className={`p-4 rounded-sm shadow-lg w-80 ${
            theme === 'dark'
            ? 'bg-black border border-zinc-800 text-white'
            : 'bg-white border border-gray-200 text-black'
          }`}>
            <h3 className="text-sm font-medium mb-3">Confirm Delete</h3>
            <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-500'}`}>
              Are you sure you want to delete this item?
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                className={`px-3 py-1 text-xs transition-colors ${
                  theme === 'dark'
                  ? 'border border-zinc-700 hover:bg-zinc-800 text-white'
                  : 'border border-gray-300 hover:bg-gray-100 text-black'
                }`}
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white transition-colors"
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