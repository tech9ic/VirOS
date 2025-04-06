import { useState, useEffect } from "react";
import { useStore } from "../store";
import { TerminalIcon, Moon, Sun, ArrowRightIcon } from "lucide-react";

const Login = () => {
  const { login } = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update the time every second to make it more accurate
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(username, password);
      if (!success) {
        setError("Invalid username or password. Hint: try user/password");
      }
    } catch (err) {
      setError("An error occurred while trying to log in");
    } finally {
      setIsLoading(false);
    }
  };

  // Format time in 24-hour format for more Linux-like feel
  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format date
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // oklama.com-inspired minimal styling
  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-black" : "bg-white"} transition-colors duration-300 font-mono antialiased`}
    >
      {/* Top status bar (minimal) */}
      <div
        className={`fixed top-0 w-full px-4 h-8 ${isDarkMode ? "bg-black border-b border-zinc-900" : "bg-white border-b border-zinc-200"} flex justify-between items-center z-10`}
      >
        <div
          className={`text-xs ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}
        >
          VirOS
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-1 rounded-sm hover:bg-opacity-10 transition ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-black"}`}
          >
            {isDarkMode ? (
              <Sun size={14} strokeWidth={1} />
            ) : (
              <Moon size={14} strokeWidth={1} />
            )}
          </button>
          <span
            className={`text-xs ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}
          >
            {formattedTime}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-xs">
          {/* oklama.com-inspired session info */}
          <div
            className={`text-left mb-16 ${isDarkMode ? "text-white" : "text-black"}`}
          >
            <div className="flex items-start space-x-4">
              <div className="mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${isDarkMode ? "bg-zinc-700" : "bg-zinc-300"}`}
                ></div>
              </div>
              <div>
                <p className="text-sm mb-1">SESSION</p>
                <p
                  className={`text-xs ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  {formattedDate.toUpperCase()}
                </p>
                <p
                  className={`text-xs ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  {formattedTime}
                </p>
              </div>
            </div>
          </div>

          {/* Login form with ultra-minimal styling */}
          <div className="mb-12">
            {error && (
              <div
                className={`mb-4 p-2 text-xs ${isDarkMode ? "text-red-400 border border-red-900 bg-black" : "text-red-600 border border-red-200 bg-white"}`}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center mb-1">
                  <div
                    className={`w-1 h-1 rounded-full mr-2 ${isDarkMode ? "bg-zinc-700" : "bg-zinc-300"}`}
                  ></div>
                  <label
                    htmlFor="username"
                    className={`text-xs uppercase ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Username
                  </label>
                </div>
                <input
                  id="username"
                  type="text"
                  className={`w-full px-0 py-1 border-b ${
                    isDarkMode
                      ? "bg-black text-white border-zinc-800 focus:border-zinc-700"
                      : "bg-white text-black border-zinc-200 focus:border-zinc-300"
                  } focus:outline-none text-sm`}
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <div className="flex items-center mb-1">
                  <div
                    className={`w-1 h-1 rounded-full mr-2 ${isDarkMode ? "bg-zinc-700" : "bg-zinc-300"}`}
                  ></div>
                  <label
                    htmlFor="password"
                    className={`text-xs uppercase ${isDarkMode ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    Password
                  </label>
                </div>
                <input
                  id="password"
                  type="password"
                  className={`w-full px-0 py-1 border-b ${
                    isDarkMode
                      ? "bg-black text-white border-zinc-800 focus:border-zinc-700"
                      : "bg-white text-black border-zinc-200 focus:border-zinc-300"
                  } focus:outline-none text-sm`}
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className={`group flex items-center ${
                    isDarkMode
                      ? "text-zinc-400 hover:text-white"
                      : "text-zinc-600 hover:text-black"
                  } transition-colors focus:outline-none text-sm`}
                  disabled={isLoading}
                >
                  <span className="mr-2">
                    {isLoading ? "AUTHENTICATING..." : "LOGIN"}
                  </span>
                  <ArrowRightIcon
                    size={14}
                    strokeWidth={1}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            </form>

            <div
              className={`mt-6 text-xs ${isDarkMode ? "text-zinc-700" : "text-zinc-400"}`}
            >
              <div className="flex items-center space-x-2">
                <TerminalIcon size={12} strokeWidth={1} />
                <p>Demo credentials: user / password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className={`fixed bottom-0 w-full px-4 py-2 ${isDarkMode ? "text-zinc-800" : "text-zinc-300"} text-xs flex justify-between items-center`}
      >
        <div>VirOS v1.0.0</div>
        <div>tech9ic</div>
      </div>
    </div>
  );
};

export default Login;
