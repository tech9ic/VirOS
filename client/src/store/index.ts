import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { DesktopItem, User, Window } from '../types';

// Storage management utilities
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit to be safe (localStorage is typically 5MB)

function getStorageSize() {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage[key].length * 2); // Approximate size in bytes
    }
  }
  return total;
}

function isStorageAlmostFull() {
  return getStorageSize() > (MAX_STORAGE_SIZE * 0.8); // 80% of maximum
}

function isStorageFull() {
  return getStorageSize() > (MAX_STORAGE_SIZE * 0.95); // 95% of maximum
}

// Safe storage update function
function safeStorageUpdate(updateFn: () => void): boolean {
  try {
    // Check if we're close to the quota
    if (isStorageFull()) {
      alert("Storage is almost full. Try emptying the Buffer or removing some files.");
      return false;
    }
    
    // Attempt the update
    updateFn();
    return true;
  } catch (error) {
    // Handle quota exceeded errors
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert("Storage quota exceeded. Try emptying the Buffer or removing some files.");
    } else {
      console.error("Storage error:", error);
      alert("An error occurred while saving data. Try emptying the Buffer or removing some files.");
    }
    return false;
  }
}

interface State {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  
  // Desktop items
  items: DesktopItem[];
  addItem: (item: Omit<DesktopItem, 'id' | 'created'>) => string;
  removeItem: (id: string) => void;
  updateItemPosition: (id: string, x: number, y: number) => void;
  updateItemContent: (id: string, content: string) => void;
  updateItemName: (id: string, name: string) => void;
  
  // Folder management
  getItemsByParentId: (parentId: string | null) => DesktopItem[];
  addItemToFolder: (item: Omit<DesktopItem, 'id' | 'created'>, parentId: string) => string;
  
  // Buffer (recycle bin) management
  bufferItems: DesktopItem[];
  moveToBuffer: (id: string) => void;
  restoreFromBuffer: (id: string) => void;
  emptyBuffer: () => void;
  getBufferItems: () => DesktopItem[];
  
  // Windows management
  windows: Window[];
  openWindow: (title: string, content: React.ReactNode, width?: number, height?: number) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
}

// Mock login - in a real app, this would verify against a backend
const mockLogin = async (username: string, password: string): Promise<boolean> => {
  // For demo purposes, we'll accept specific username/password combinations
  if (username === 'user' && password === 'password') {
    return true;
  }
  if (username === 'tech9ic' && password === 'hsy-17@m') {
    return true;
  }
  return false;
};

// Initialize with default items
const defaultItems: DesktopItem[] = [
  {
    id: 'computer-1',
    name: 'System',
    type: 'computer',
    position: { x: 15, y: 15 },
    created: new Date(),
  },
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    position: { x: 15, y: 35 },
    created: new Date(),
  },
  {
    id: 'terminal-1',
    name: 'Terminal',
    type: 'terminal',
    position: { x: 15, y: 55 },
    created: new Date(),
  },
  {
    id: 'trash-1',
    name: 'Buffer',
    type: 'trash',
    position: { x: 15, y: 75 },
    created: new Date(),
  }
];

// Function to clear localStorage and reset state
export function resetStorage() {
  localStorage.removeItem('os-storage');
  window.location.reload();
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      isAuthenticated: false,
      login: async (username, password) => {
        const success = await mockLogin(username, password);
        if (success) {
          set({ 
            user: { username },
            isAuthenticated: true
          });
        }
        return success;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      // Theme
      theme: 'dark',
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark'
        }));
      },
      
      // Desktop items
      items: defaultItems,
      bufferItems: [],
      addItem: (item) => {
        const id = uuidv4();
        
        // Check storage before adding
        if (isStorageAlmostFull()) {
          const proceed = window.confirm("Storage is getting full. This may cause issues. Would you like to empty the Buffer first?");
          if (proceed) {
            set({ bufferItems: [] });
          }
        }
        
        const success = safeStorageUpdate(() => {
          set((state) => ({
            items: [
              ...state.items,
              {
                ...item,
                id,
                created: new Date(),
                parentId: null, // Default to desktop
              },
            ],
          }));
        });
        
        return success ? id : "";
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id && item.parentId !== id), // Remove item and its children
        }));
      },
      updateItemPosition: (id, x, y) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, position: { x, y } }
              : item
          ),
        }));
      },
      updateItemContent: (id, content) => {
        // Handle large content
        if (content && content.length > 500000) { // ~500KB
          alert("Content too large. Please try with a smaller file.");
          return;
        }
        
        // Use safe storage
        safeStorageUpdate(() => {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id
                ? { ...item, content }
                : item
            ),
          }));
        });
      },
      updateItemName: (id, name) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, name }
              : item
          ),
        }));
      },
      
      // Folder management
      getItemsByParentId: (parentId) => {
        return get().items.filter(item => item.parentId === parentId);
      },
      
      addItemToFolder: (item, parentId) => {
        const id = uuidv4();
        
        // Check storage availability
        if (isStorageAlmostFull()) {
          const proceed = window.confirm("Storage is getting full. This may cause issues. Would you like to empty the Buffer first?");
          if (proceed) {
            set({ bufferItems: [] });
          }
        }
        
        const success = safeStorageUpdate(() => {
          set((state) => ({
            items: [
              ...state.items,
              {
                ...item,
                id,
                created: new Date(),
                parentId, // Set the parent folder ID
                position: { x: 20, y: 20 }, // Default position within folder
              },
            ],
          }));
        });
        
        return success ? id : "";
      },
      
      // Buffer management
      moveToBuffer: (id) => {
        // Push into buffer
        const item = get().items.find((item) => item.id === id);
        if (!item) return;
        
        // Remove the item from the desktop
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          bufferItems: [...(state.bufferItems || []), { ...item, parentId: 'buffer' }]
        }));
      },
      
      restoreFromBuffer: (id) => {
        // Find the item in the buffer
        const item = get().bufferItems.find((item) => item.id === id);
        if (!item) return;
        
        // Restore the item to the desktop
        set((state) => ({
          items: [...state.items, { ...item, parentId: null }],
          bufferItems: state.bufferItems.filter((item) => item.id !== id)
        }));
      },
      
      emptyBuffer: () => {
        // Empty the buffer
        set((state) => ({
          bufferItems: []
        }));
      },
      
      getBufferItems: () => {
        // Return all items in buffer
        return get().bufferItems;
      },
      
      // Windows management
      windows: [],
      openWindow: (title, content, width = 600, height = 400) => {
        const id = uuidv4();
        const { windows } = get();
        const highestZIndex = windows.length > 0
          ? Math.max(...windows.map(w => w.zIndex))
          : 0;
        
        // Windows aren't stored in localStorage, so we don't need to check storage space
        // But we should check if there are too many windows open to prevent memory issues
        if (windows.length > 10) {
          // If too many windows, close the oldest one
          const oldestWindowId = windows[0].id;
          set((state) => ({
            windows: state.windows.filter(w => w.id !== oldestWindowId)
          }));
        }
        
        try {
          set((state) => ({
            windows: [
              ...state.windows,
              {
                id,
                title,
                content,
                position: { x: 50, y: 50 },
                size: { width, height },
                isMinimized: false,
                isMaximized: false,
                zIndex: highestZIndex + 1,
              },
            ],
          }));
          return id;
        } catch (error) {
          console.error("Error opening window:", error);
          alert("Could not open window. Try closing some windows first.");
          return "";
        }
      },
      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((window) => window.id !== id),
        }));
      },
      minimizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, isMinimized: true }
              : window
          ),
        }));
      },
      maximizeWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, isMaximized: true, isMinimized: false }
              : window
          ),
        }));
      },
      restoreWindow: (id) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, isMaximized: false, isMinimized: false }
              : window
          ),
        }));
      },
      focusWindow: (id) => {
        const { windows } = get();
        const highestZIndex = windows.length > 0
          ? Math.max(...windows.map(w => w.zIndex))
          : 0;
          
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, zIndex: highestZIndex + 1, isMinimized: false }
              : window
          ),
        }));
      },
      updateWindowPosition: (id, x, y) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, position: { x, y } }
              : window
          ),
        }));
      },
      updateWindowSize: (id, width, height) => {
        set((state) => ({
          windows: state.windows.map((window) =>
            window.id === id
              ? { ...window, size: { width, height } }
              : window
          ),
        }));
      },
    }),
    {
      name: 'os-storage',
      partialize: (state) => ({
        items: state.items,
        bufferItems: state.bufferItems,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme
      }),
    }
  )
);