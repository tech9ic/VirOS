import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Terminal } from 'lucide-react';

interface TerminalWindowProps {
  username: string;
}

type CommandOutputType = {
  command: string;
  output: string;
  isError?: boolean;
};

export const TerminalWindow = ({ username }: TerminalWindowProps) => {
  const [command, setCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandOutputType[]>([]);
  const [userIp, setUserIp] = useState('127.0.0.1');
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const { closeWindow } = useStore();
  
  // Simulate getting an IP address
  useEffect(() => {
    // In a real application, you'd make an API call to get the user's IP
    // Here we'll just generate a random one for demonstration
    const randomIp = Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
    setUserIp(randomIp);
  }, []);

  // Auto focus the terminal input when it loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto scroll to bottom when new commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const processCommand = (input: string) => {
    const commandLower = input.trim().toLowerCase();
    let output = '';
    let isError = false;

    switch (commandLower) {
      case 'whoami':
        output = `User: ${username}\nIP Address: ${userIp}`;
        break;
      case 'exit':
        // Close terminal window
        const windows = useStore.getState().windows;
        const terminalWindow = windows.find(w => w.title === 'Terminal');
        if (terminalWindow) {
          closeWindow(terminalWindow.id);
        }
        return; // Don't add to history as we're closing
      case 'help':
        output = 'Available commands:\n- whoami: Show user and IP information\n- exit: Close terminal\n- help: Show this help menu';
        break;
      case 'clear':
        setCommandHistory([]);
        return; // Don't add to history
      case '':
        return; // Don't add empty commands to history
      default:
        output = `Command not found: ${input}`;
        isError = true;
    }

    setCommandHistory([...commandHistory, { command: input, output, isError }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(command);
      setCommand('');
    }
  };

  return (
    <div className="p-4 font-mono text-white bg-black h-full flex flex-col">
      <div className="border-b border-zinc-800 pb-2 mb-4 flex justify-between items-center">
        <h3 className="text-sm font-medium">Terminal</h3>
      </div>
      <div 
        ref={terminalRef} 
        className="flex-1 bg-zinc-900 p-2 overflow-y-auto font-mono text-xs text-green-500"
      >
        <div className="mb-1">Last login: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
        <div className="mb-1">Terminal OS [Version 1.0.0]</div>
        <div className="mb-3">(c) 2025 Terminal Corporation. All rights reserved.</div>
        
        {/* Command history */}
        {commandHistory.map((item, index) => (
          <div key={index} className="mb-2">
            <div className="flex">
              <span className="mr-2 text-white">{username}@terminal:~$</span>
              <span>{item.command}</span>
            </div>
            <div className={`whitespace-pre-line pl-0 ${item.isError ? 'text-red-400' : ''}`}>
              {item.output}
            </div>
          </div>
        ))}
        
        {/* Active prompt */}
        <div className="flex items-center">
          <span className="mr-2 text-white">{username}@terminal:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none flex-1 text-green-500 caret-green-500"
            autoFocus
          />
        </div>
      </div>
    </div>
  );
};

export default TerminalWindow;