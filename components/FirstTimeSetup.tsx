import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Loader2 } from 'lucide-react';

interface FirstTimeSetupProps {
  onComplete: () => void;
}

const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initializing...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate installation progress over 2 minutes (120 seconds)
    const totalDuration = 120000; // 2 minutes in milliseconds
    const updateInterval = 100; // Update every 100ms
    const totalSteps = totalDuration / updateInterval;
    const progressIncrement = 100 / totalSteps;

    let currentProgress = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      currentProgress += progressIncrement;

      // Update status messages at different progress points
      if (currentProgress < 20) {
        setStatus('Checking system requirements...');
      } else if (currentProgress < 40) {
        setStatus('Downloading Chrome browser...');
      } else if (currentProgress < 60) {
        setStatus('Installing dependencies...');
      } else if (currentProgress < 80) {
        setStatus('Configuring automation engine...');
      } else if (currentProgress < 95) {
        setStatus('Finalizing setup...');
      } else {
        setStatus('Setup complete!');
      }

      setProgress(Math.min(currentProgress, 100));

      // Complete when reaching 100%
      if (currentProgress >= 100) {
        clearInterval(timer);
        setIsComplete(true);

        // Mark as installed in localStorage
        localStorage.setItem('autojobzy_installed', 'true');

        // Auto-close after 1 second
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    }, updateInterval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-dark-800 to-dark-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue to-blue-500 p-6">
          <div className="flex items-center justify-center gap-3">
            {isComplete ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
            <h2 className="text-2xl font-bold text-white">
              {isComplete ? 'Setup Complete!' : 'Wait for dependency installation.'}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Status Message */}
          <div className="text-center">
            <p className="text-gray-300 text-lg font-medium mb-2">
              {status}
            </p>
            <p className="text-gray-500 text-sm">
              {isComplete
                ? 'You can now start using AutoJobzy!'
                : 'Please wait while we set up everything for you...'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-neon-blue font-bold">{Math.round(progress)}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden border border-gray-700">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-blue-500 transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <Download className="w-16 h-16 text-neon-blue animate-pulse" />
              {isComplete && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Info Text */}
          <div className="bg-dark-800 border border-gray-700 rounded-lg p-4">
            <p className="text-gray-400 text-xs text-center">
              {isComplete
                ? 'All dependencies installed successfully'
                : 'Installing Chrome browser and automation tools. This is a one-time setup and will take approximately 2 minutes.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        {!isComplete && (
          <div className="bg-dark-800 border-t border-gray-700 px-8 py-4">
            <p className="text-center text-gray-500 text-xs">
              Do not close this window
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default FirstTimeSetup;
