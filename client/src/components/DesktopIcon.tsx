import { useDrag } from 'react-dnd';
import { useStore } from '../store';
import { DesktopItem } from '../types';
import { FolderIcon, MonitorIcon, FileTextIcon, FileIcon, TrashIcon } from 'lucide-react';

interface DesktopIconProps {
  item: DesktopItem;
}

const DesktopIcon = ({ item }: DesktopIconProps) => {
  const { openWindow } = useStore();

  // Setup drag source
  const [{ isDragging }, drag] = useDrag({
    type: 'DESKTOP_ITEM',
    item: { id: item.id, type: item.type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Double click handler for opening windows
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
              {/* Placeholder folder content */}
              <div className="text-center group cursor-pointer hover:opacity-80">
                <div className="bg-zinc-900 p-3 mb-1 rounded-sm">
                  <FolderIcon className="mx-auto" size={24} strokeWidth={1} />
                </div>
                <p className="text-xs truncate text-zinc-400 group-hover:text-white transition-colors">Documents</p>
              </div>
              <div className="text-center group cursor-pointer hover:opacity-80">
                <div className="bg-zinc-900 p-3 mb-1 rounded-sm">
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
        return <FolderIcon size={32} className="text-white" strokeWidth={1} />;
      case 'computer':
        return <MonitorIcon size={32} className="text-white" strokeWidth={1} />;
      case 'file':
        return <FileTextIcon size={32} className="text-white" strokeWidth={1} />;
      case 'trash':
        return <TrashIcon size={32} className="text-white" strokeWidth={1} />;
      case 'app':
        return <FileIcon size={32} className="text-white" strokeWidth={1} />;
      default:
        return <FileIcon size={32} className="text-white" strokeWidth={1} />;
    }
  };

  // Position randomly in a grid-like pattern similar to oklama.com
  // Unless a specific position is already set
  const isInitialPosition = item.position.x === 20 && (item.position.y === 20 || item.position.y === 120);
  const randomPosition = () => {
    if (!isInitialPosition) return item.position;
    
    // Generate more oklama-like positions
    const positions = [
      { x: Math.floor(Math.random() * 65) + 15, y: Math.floor(Math.random() * 50) + 15 },  // top left
      { x: Math.floor(Math.random() * 65) + 55, y: Math.floor(Math.random() * 50) + 15 },  // top right
      { x: Math.floor(Math.random() * 65) + 15, y: Math.floor(Math.random() * 50) + 48 },  // bottom left
      { x: Math.floor(Math.random() * 65) + 55, y: Math.floor(Math.random() * 50) + 48 },  // bottom right
    ];
    
    // Choose one randomly
    return positions[Math.floor(Math.random() * positions.length)];
  };
  
  const position = isInitialPosition ? randomPosition() : item.position;

  return (
    <div
      ref={drag}
      className="flex flex-col items-center justify-center pointer-events-none absolute text-sm"
      style={{
        opacity: isDragging ? 0.5 : 1,
        top: `${position.y}%`,
        left: `${position.x}%`,
        width: '90px',
        WebkitTouchCallout: 'none',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div 
        className="pointer-events-auto rendering-pixelated w-16 h-16 flex items-center justify-center bg-zinc-900 rounded-sm"
      >
        {renderIcon()}
      </div>
      <span className="pointer-events-auto text-center text-white bg-black bg-opacity-80 px-1 text-xs mt-1">
        {item.name}
      </span>
    </div>
  );
};

export default DesktopIcon;