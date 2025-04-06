import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Desktop from '../components/Desktop';
import Login from '../components/Login';
import { useStore } from '../store';

const Home = () => {
  const { isAuthenticated } = useStore();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <Desktop />
    </DndProvider>
  );
};

export default Home;