// User related types
export interface User {
  username: string;
}

// Position and size related types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Desktop item types
export type ItemType = 'computer' | 'folder' | 'file' | 'app' | 'trash';

export interface DesktopItem {
  id: string;
  name: string;
  type: ItemType;
  position: Position;
  created: Date;
  content?: string;
  iconSrc?: string;
}

// Window related types
export interface Window {
  id: string;
  title: string;
  content: React.ReactNode;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}