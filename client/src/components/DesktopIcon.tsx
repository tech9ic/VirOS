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
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Folder: {item.name}</h3>
            <div className="grid grid-cols-4 gap-4">
              {/* Placeholder folder content */}
              <div className="text-center">
                <FolderIcon className="mx-auto mb-1" size={24} />
                <p className="text-xs truncate">Documents</p>
              </div>
              <div className="text-center">
                <FileTextIcon className="mx-auto mb-1" size={24} />
                <p className="text-xs truncate">Report.pdf</p>
              </div>
            </div>
          </div>
        );
        break;
      case 'computer':
        content = (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">My Computer</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-2 border rounded hover:bg-blue-50">
                <FolderIcon className="mx-auto mb-1" size={24} />
                <p className="text-xs">Local Disk (C:)</p>
              </div>
              <div className="text-center p-2 border rounded hover:bg-blue-50">
                <FolderIcon className="mx-auto mb-1" size={24} />
                <p className="text-xs">Network</p>
              </div>
            </div>
          </div>
        );
        break;
      default:
        content = (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">{item.name}</h3>
            {item.content && <p>{item.content}</p>}
          </div>
        );
    }
    
    openWindow(item.name, content);
  };

  // Render icon based on item type
  const renderIcon = () => {
    switch(item.type) {
      case 'folder':
        return <FolderIcon size={32} className="text-yellow-500" />;
      case 'computer':
        return <MonitorIcon size={32} className="text-blue-600" />;
      case 'file':
        return <FileTextIcon size={32} className="text-gray-600" />;
      case 'trash':
        return <TrashIcon size={32} className="text-gray-600" />;
      case 'app':
        return <FileIcon size={32} className="text-purple-600" />;
      default:
        return <FileIcon size={32} className="text-gray-600" />;
    }
  };

  return (
    <div
      ref={drag}
      className="os-desktop-icon absolute"
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: `translate(${item.position.x}px, ${item.position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <div className="os-icon-container">
        {renderIcon()}
      </div>
      <div className="os-icon-label">
        {item.name}
      </div>
    </div>
  );
};

export default DesktopIcon;