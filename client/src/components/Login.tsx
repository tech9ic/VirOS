import { useState } from 'react';
import { useStore } from '../store';
import { MonitorIcon } from 'lucide-react';

const Login = () => {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password. Hint: try user/password');
      }
    } catch (err) {
      setError('An error occurred while trying to log in');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900">
      <div className="animate-fade-in w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 bg-blue-800 rounded-full flex items-center justify-center shadow-lg mb-4">
            <MonitorIcon size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">WebOS</h1>
          <p className="text-blue-300 mt-1">Web Operating System</p>
        </div>
        
        <div className="bg-blue-800 rounded-lg shadow-xl overflow-hidden animate-slide-up">
          <div className="p-8">
            <h2 className="text-xl font-medium text-white mb-4">Login</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-blue-200 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="os-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-blue-200 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="os-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="os-button"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            
            <div className="mt-4 text-center text-blue-300 text-sm">
              <p>Demo credentials: user / password</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;