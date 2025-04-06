import { useState } from 'react';
import { useStore } from '../store';
import { MonitorIcon, LogOutIcon } from 'lucide-react';

const TaskBar = () => {
  const { windows, focusWindow, logout } = useStore();
  const [showStartMenu, setShowStartMenu] = useState(false);
  
  const toggleStartMenu = () => {
    setShowStartMenu(!showStartMenu);
  };
  
  const handleWindowClick = (id: string) => {
    focusWindow(id);
  };

  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 os-taskbar">
      <div 
        className="os-taskbar-start"
        onClick={toggleStartMenu}
      >
        <MonitorIcon size={18} className="mr-2" />
        <span>Start</span>
      </div>
      
      <div className="flex-1 px-1 flex items-center space-x-2 overflow-x-auto">
        {windows
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((window) => (
            <button
              key={window.id}
              className={`os-taskbar-item ${
                !window.isMinimized && window.zIndex === Math.max(...windows.map(w => w.zIndex))
                  ? 'os-taskbar-item-active'
                  : 'os-taskbar-item-inactive'
              }`}
              onClick={() => handleWindowClick(window.id)}
            >
              <MonitorIcon size={16} />
              <span className="truncate max-w-[150px]">{window.title}</span>
            </button>
          ))}
      </div>
      
      <div className="px-2 text-xs text-center">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      
      {/* Start Menu */}
      {showStartMenu && (
        <div className="os-start-menu">
          <div className="os-start-menu-user">
            <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center">
              <span className="text-lg font-semibold text-white">U</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-medium">User</div>
            </div>
          </div>
          
          <div className="py-1">
            <div className="os-start-menu-item">
              <MonitorIcon size={18} />
              <span>Computer</span>
            </div>
            <div className="os-start-menu-item">
              <MonitorIcon size={18} />
              <span>Documents</span>
            </div>
            <div className="os-start-menu-item">
              <MonitorIcon size={18} />
              <span>Pictures</span>
            </div>
            <div className="os-start-menu-item">
              <MonitorIcon size={18} />
              <span>Settings</span>
            </div>
            <div className="border-t border-blue-800 my-1"></div>
            <div className="os-start-menu-item" onClick={handleLogout}>
              <LogOutIcon size={18} />
              <span>Log Out</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBar;