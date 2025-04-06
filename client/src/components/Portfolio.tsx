import React, { useState } from 'react';
import { useStore } from '../store';
import { GithubIcon, MailIcon, LinkedinIcon, Globe, Book } from 'lucide-react';

const Portfolio = () => {
  const { theme } = useStore();
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'projects' | 'contact'>('about');
  
  // ASCII art for the portfolio - simplified version due to space constraints
  const asciiArt = `
  ██████╗ ██╗██████╗ ██╗  ██╗██╗   ██╗████████╗██╗     ███████╗██╗  ██╗███████╗
  ██╔══██╗██║██╔══██╗██║  ██║██║   ██║╚══██╔══╝██║     ██╔════╝╚██╗██╔╝██╔════╝
  ██████╔╝██║██████╔╝███████║██║   ██║   ██║   ██║     █████╗   ╚███╔╝ █████╗  
  ██╔══██╗██║██╔══██╗██╔══██║██║   ██║   ██║   ██║     ██╔══╝   ██╔██╗ ██╔══╝  
  ██████╔╝██║██████╔╝██║  ██║╚██████╔╝   ██║   ███████╗███████╗██╔╝ ██╗███████╗
  ╚═════╝ ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝
  `;

  return (
    <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-800'}`}>
      {/* Header with ASCII Art */}
      <div className="p-4 border-b border-zinc-800">
        <pre className={`text-xs md:text-sm font-mono leading-tight ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>
          {asciiArt}
        </pre>
        <div className="mt-4 text-center">
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Bibhuti Bhusan Majhi</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-gray-600'}`}>Full Stack Developer | tech9ic</p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
        <button 
          onClick={() => setActiveTab('about')}
          className={`py-2 px-4 text-sm ${activeTab === 'about' 
            ? theme === 'dark' 
              ? 'border-b-2 border-lime-500 text-lime-500' 
              : 'border-b-2 border-lime-600 text-lime-700'
            : theme === 'dark'
              ? 'text-zinc-400'
              : 'text-gray-600'
          }`}
        >
          About
        </button>
        <button 
          onClick={() => setActiveTab('skills')}
          className={`py-2 px-4 text-sm ${activeTab === 'skills' 
            ? theme === 'dark' 
              ? 'border-b-2 border-lime-500 text-lime-500' 
              : 'border-b-2 border-lime-600 text-lime-700'
            : theme === 'dark'
              ? 'text-zinc-400'
              : 'text-gray-600'
          }`}
        >
          Skills
        </button>
        <button 
          onClick={() => setActiveTab('projects')}
          className={`py-2 px-4 text-sm ${activeTab === 'projects' 
            ? theme === 'dark' 
              ? 'border-b-2 border-lime-500 text-lime-500' 
              : 'border-b-2 border-lime-600 text-lime-700'
            : theme === 'dark'
              ? 'text-zinc-400'
              : 'text-gray-600'
          }`}
        >
          Projects
        </button>
        <button 
          onClick={() => setActiveTab('contact')}
          className={`py-2 px-4 text-sm ${activeTab === 'contact' 
            ? theme === 'dark' 
              ? 'border-b-2 border-lime-500 text-lime-500' 
              : 'border-b-2 border-lime-600 text-lime-700'
            : theme === 'dark'
              ? 'text-zinc-400'
              : 'text-gray-600'
          }`}
        >
          Contact
        </button>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 font-mono">
        {activeTab === 'about' && (
          <div>
            <h2 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>About Me</h2>
            <p className="text-sm mb-3">
              I'm Bibhuti Bhusan Majhi, a passionate full-stack developer with expertise in creating scalable web applications. With a focus on clean code and user-centric design, I build solutions that combine functionality with elegant interfaces.
            </p>
            <p className="text-sm mb-3">
              My journey in software development began with a fascination for creating interactive experiences. This led me to explore various frameworks and technologies, allowing me to develop a versatile skill set that spans the entire development stack.
            </p>
            <p className="text-sm">
              When I'm not coding, I enjoy exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community.
            </p>
          </div>
        )}
        
        {activeTab === 'skills' && (
          <div>
            <h2 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Technical Skills</h2>
            
            <div className="mb-4">
              <h3 className={`text-md font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Languages</h3>
              <div className="flex flex-wrap gap-2">
                {['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL'].map(skill => (
                  <span key={skill} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700'}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className={`text-md font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Frameworks & Libraries</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Node.js', 'Express', 'Next.js', 'TailwindCSS', 'MongoDB', 'PostgreSQL'].map(skill => (
                  <span key={skill} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700'}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className={`text-md font-semibold mb-2 ${theme === 'dark' ? 'text-zinc-300' : 'text-gray-700'}`}>Tools & Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {['Git', 'Docker', 'AWS', 'GitHub Actions', 'VS Code', 'Figma'].map(skill => (
                  <span key={skill} className={`text-xs px-2 py-1 rounded ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-700'}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'projects' && (
          <div>
            <h2 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Featured Projects</h2>
            
            <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
              <h3 className="text-md font-semibold">VirOS (Terminal OS)</h3>
              <p className="text-xs mb-2">A web-based terminal OS simulation providing a desktop environment with system applications and utilities.</p>
              <div className="flex gap-2 items-center text-xs">
                <span className={`${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Technologies:</span>
                <span>React, TypeScript, TailwindCSS</span>
              </div>
            </div>
            
            <div className={`mb-4 p-3 rounded ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
              <h3 className="text-md font-semibold">ASCII Art Generator</h3>
              <p className="text-xs mb-2">A tool that converts images to ASCII art with customizable settings and real-time preview.</p>
              <div className="flex gap-2 items-center text-xs">
                <span className={`${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Technologies:</span>
                <span>JavaScript, Canvas API, Node.js</span>
              </div>
            </div>
            
            <div className={`p-3 rounded ${theme === 'dark' ? 'bg-zinc-900' : 'bg-gray-100'}`}>
              <h3 className="text-md font-semibold">Portfolio Website</h3>
              <p className="text-xs mb-2">A responsive portfolio website with dark/light theme support and interactive elements.</p>
              <div className="flex gap-2 items-center text-xs">
                <span className={`${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Technologies:</span>
                <span>React, Next.js, TailwindCSS</span>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'contact' && (
          <div>
            <h2 className={`text-lg font-bold mb-3 ${theme === 'dark' ? 'text-lime-500' : 'text-lime-700'}`}>Contact Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MailIcon size={18} className={theme === 'dark' ? 'text-lime-500' : 'text-lime-700'} />
                <a href="mailto:mailtobbm@gmail.com" className="text-sm hover:underline">mailtobbm@gmail.com</a>
              </div>
              
              <div className="flex items-center gap-3">
                <GithubIcon size={18} className={theme === 'dark' ? 'text-lime-500' : 'text-lime-700'} />
                <a href="https://github.com/tech9ic" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">github.com/tech9ic</a>
              </div>
              
              <div className="flex items-center gap-3">
                <LinkedinIcon size={18} className={theme === 'dark' ? 'text-lime-500' : 'text-lime-700'} />
                <a href="#" className="text-sm hover:underline">linkedin.com/in/bibhuti-bhusan-majhi</a>
              </div>
              
              <div className="flex items-center gap-3">
                <Globe size={18} className={theme === 'dark' ? 'text-lime-500' : 'text-lime-700'} />
                <a href="#" className="text-sm hover:underline">tech9ic.com</a>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <p className="text-xs text-center">
                Feel free to reach out for collaboration opportunities, project inquiries, or just to connect!
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={`p-2 text-center text-xs ${theme === 'dark' ? 'bg-zinc-900 text-zinc-500' : 'bg-gray-100 text-gray-500'}`}>
        © {new Date().getFullYear()} Bibhuti Bhusan Majhi | tech9ic
      </div>
    </div>
  );
};

export default Portfolio;