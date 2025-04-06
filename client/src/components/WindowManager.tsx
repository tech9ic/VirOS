import { useStore } from '../store';
import WindowComponent from './WindowComponent';

const WindowManager = () => {
  const { windows } = useStore();
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {windows.map((window) => (
        <WindowComponent key={window.id} window={window} />
      ))}
    </div>
  );
};

export default WindowManager;