import React, { useState, useEffect, useRef } from 'react';

const LOG_MESSAGES = [
  { text: "Initializing AutoJobzy v2.5...", color: "text-gray-400" },
  { text: "Connecting to secure server...", color: "text-gray-400" },
  { text: "Success: Connected securely.", color: "text-green-400" },
  { text: "Scanning for 'Frontend Developer' roles...", color: "text-neon-blue" },
  { text: "Found 12 new matches.", color: "text-white" },
  { text: "> Analyzing Match 1: LinkedIn - React Dev", color: "text-yellow-400" },
  { text: "  Skills Match: 95% (High)", color: "text-green-400" },
  { text: "  Auto-filling application form...", color: "text-gray-300" },
  { text: "  Uploading resume_v4.pdf...", color: "text-gray-300" },
  { text: "✔ Application Submitted Successfully!", color: "text-green-500 font-bold" },
  { text: "> Analyzing Match 2: Indeed - Jr. Software Engineer", color: "text-yellow-400" },
  { text: "  Skills Match: 88%", color: "text-green-400" },
  { text: "  Answering screener questions...", color: "text-gray-300" },
  { text: "✔ Application Submitted Successfully!", color: "text-green-500 font-bold" },
  { text: "Waiting for next cycle...", color: "text-gray-500" }
];

const TerminalDemo: React.FC = () => {
  const [logs, setLogs] = useState<typeof LOG_MESSAGES>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < LOG_MESSAGES.length) {
      const timeout = setTimeout(() => {
        setLogs(prev => [...prev, LOG_MESSAGES[currentIndex]]);
        setCurrentIndex(prev => prev + 1);
      }, Math.random() * 800 + 400); // Random delay between 400ms and 1200ms
      return () => clearTimeout(timeout);
    } else {
      // Reset after a delay to loop
      const resetTimeout = setTimeout(() => {
        setLogs([]);
        setCurrentIndex(0);
      }, 3000);
      return () => clearTimeout(resetTimeout);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full max-w-lg mx-auto bg-dark-900 rounded-lg overflow-hidden border border-gray-700 shadow-2xl shadow-neon-blue/10 transform transition-transform hover:scale-[1.02]">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
        <span className="ml-2 text-xs text-gray-400 font-mono">bot_process.exe — Running</span>
      </div>
      
      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto font-mono text-sm bg-black/90 space-y-2"
      >
        {logs.map((log, idx) => (
          <div key={idx} className={`${log.color} animate-fade-in`}>
            <span className="mr-2 opacity-50">{(new Date()).toLocaleTimeString().split(' ')[0]}</span>
            {log.text}
          </div>
        ))}
        <div className="w-2 h-4 bg-neon-green animate-pulse inline-block align-middle ml-1"></div>
      </div>
    </div>
  );
};

export default TerminalDemo;
