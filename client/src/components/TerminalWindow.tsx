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
        output = 'Available commands:\n- whoami: Show user and IP information\n- date: Display current date and time\n- echo [text]: Echo back text\n- fortune: Get a random fortune message\n- neofetch: Display system information\n- ls: List desktop items\n- cowsay [message]: Display a cow saying message\n- uname: Display OS name\n- ping [address]: Simulate pinging an address\n- clear: Clear terminal\n- exit: Close terminal\n- help: Show this help menu';
        break;
      case 'clear':
        setCommandHistory([]);
        return; // Don't add to history
      case 'date':
        output = new Date().toString();
        break;
      case 'neofetch':
        output = `
 \\    /
  \\  /      _____
   \\/      |     |    VirOS 1.1.0
   /\\      |_____|    User: ${username}
  /  \\                Terminal: xterm-256color
 /    \\               Memory: 1024MB / 4096MB
                      IP: ${userIp}
                      Theme: Cyberpunk
        `;
        break;
      case 'uname':
        output = 'VirOS';
        break;
      case 'ls':
        const items = useStore.getState().items;
        output = items.map((item: { name: string }) => item.name).join('  ');
        break;
      case 'fortune':
        const fortunes = [
          "You will soon embark on a new coding adventure.",
          "A clever commit message will bring you good luck.",
          "The bug you've been hunting is hiding in plain sight.",
          "Today is a good day to refactor your code.",
          "A PR approval is in your future.",
          "Expect a merge conflict before the day is done.",
          "Your next deployment will go smoothly. No errors.",
          "Help a fellow developer today, karma will return.",
          "The documentation you seek exists, just not where you're looking.",
          "The answer is on Stack Overflow, but not on the first page."
        ];
        output = fortunes[Math.floor(Math.random() * fortunes.length)];
        break;
      case '':
        return; // Don't add empty commands to history
      default:
        if (commandLower.startsWith('echo ')) {
          output = input.substring(5);
        } else if (commandLower.startsWith('cowsay ')) {
          const message = input.substring(7);
          output = `
  ${'_'.repeat(message.length + 2)}
 < ${message} >
  ${'-'.repeat(message.length + 2)}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
          `;
        } else if (commandLower.startsWith('ping ')) {
          const address = input.substring(5);
          output = `PING ${address} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.080 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.074 ms\n64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.082 ms\n\n--- ${address} ping statistics ---\n3 packets transmitted, 3 packets received, 0.0% packet loss\nround-trip min/avg/max/stddev = 0.074/0.079/0.082/0.003 ms`;
        } else {
          output = `Command not found: ${input}`;
          isError = true;
        }
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
        <div className="mb-1">VirOS [Version 1.1.0]</div>
        <div className="mb-3">(c) 2025 Bibhuti Bhusan Majhi. All rights reserved.</div>
        
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