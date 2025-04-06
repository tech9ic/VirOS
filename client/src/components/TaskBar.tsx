import { useState } from 'react';
import { useStore } from '../store';
import { MonitorIcon, TerminalIcon, FolderIcon, SettingsIcon, LogOutIcon, RefreshCwIcon } from 'lucide-react';
import { resetStorage } from '../store';

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
    <div className="fixed bottom-0 left-0 right-0 h-10 bg-black border-t border-zinc-800 font-mono flex items-center text-white text-xs z-10">
      {/* Terminal button (replaces Start) */}
      <div 
        className="h-full px-3 flex items-center hover:bg-zinc-900 cursor-pointer transition-colors"
        onClick={toggleStartMenu}
      >
        <TerminalIcon size={16} className="mr-2" strokeWidth={1} />
        <span>_</span>
      </div>
      
      {/* Active windows */}
      <div className="flex-1 px-1 flex items-center space-x-1 overflow-x-auto">
        {windows
          .filter(window => !window.isMinimized)
          .sort((a, b) => a.title.localeCompare(b.title))
          .map((window) => (
            <button
              key={window.id}
              className={`px-3 py-1 flex items-center space-x-1 transition-colors border-b ${
                window.zIndex === Math.max(...windows.map(w => w.zIndex))
                  ? 'border-white'
                  : 'border-transparent hover:border-zinc-700'
              }`}
              onClick={() => handleWindowClick(window.id)}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>
              <span className="truncate max-w-[120px] opacity-70">{window.title}</span>
            </button>
          ))}
      </div>
      
      {/* Terminal Menu */}
      {showStartMenu && (
        <div className="absolute left-0 bottom-10 w-56 bg-black border border-zinc-800 shadow-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-800 flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center">
              <MonitorIcon size={16} strokeWidth={1} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-sm">VirOS</div>
              <div className="text-xs text-zinc-500">v1.1.0</div>
            </div>
          </div>
          
          <div className="py-1 text-sm">
            <div className="px-3 py-2 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center space-x-3">
              <MonitorIcon size={16} strokeWidth={1} className="text-zinc-400" />
              <span>System</span>
            </div>
            <div className="px-3 py-2 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center space-x-3">
              <FolderIcon size={16} strokeWidth={1} className="text-zinc-400" />
              <span>Projects</span>
            </div>
            <div className="px-3 py-2 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center space-x-3">
              <SettingsIcon size={16} strokeWidth={1} className="text-zinc-400" />
              <span>Settings</span>
            </div>
            <div 
              className="px-3 py-2 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center space-x-3"
              onClick={() => {
                if (confirm('Reset application storage? This will refresh your desktop to factory settings.')) {
                  resetStorage();
                }
                setShowStartMenu(false);
              }}
            >
              <RefreshCwIcon size={16} strokeWidth={1} className="text-zinc-400" />
              <span>Reset</span>
            </div>
            <div className="border-t border-zinc-800 my-1"></div>
            <div 
              className="px-3 py-2 hover:bg-zinc-900 cursor-pointer transition-colors flex items-center space-x-3"
              onClick={handleLogout}
            >
              <LogOutIcon size={16} strokeWidth={1} className="text-zinc-400" />
              <span>Log Out</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBar;