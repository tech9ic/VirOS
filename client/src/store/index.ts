import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { DesktopItem, User, Window } from '../types';

interface State {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Desktop items
  items: DesktopItem[];
  addItem: (item: Omit<DesktopItem, 'id' | 'created'>) => string;
  removeItem: (id: string) => void;
  updateItemPosition: (id: string, x: number, y: number) => void;
  updateItemContent: (id: string, content: string) => void;
  
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
  // For demo purposes, we'll accept a specific username/password
  if (username === 'user' && password === 'password') {
    return true;
  }
  return false;
};

// Initialize with default items
const defaultItems: DesktopItem[] = [
  {
    id: 'computer-1',
    name: 'My Computer',
    type: 'computer',
    position: { x: 20, y: 20 },
    created: new Date(),
  },
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    position: { x: 20, y: 120 },
    created: new Date(),
  }
];

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
      
      // Desktop items
      items: defaultItems,
      addItem: (item) => {
        const id = uuidv4();
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              id,
              created: new Date(),
            },
          ],
        }));
        return id;
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
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
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, content }
              : item
          ),
        }));
      },
      
      // Windows management
      windows: [],
      openWindow: (title, content, width = 600, height = 400) => {
        const id = uuidv4();
        const { windows } = get();
        const highestZIndex = windows.length > 0
          ? Math.max(...windows.map(w => w.zIndex))
          : 0;
          
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
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);