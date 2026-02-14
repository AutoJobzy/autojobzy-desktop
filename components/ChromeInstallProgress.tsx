/**
 * Chrome Installation Progress Modal
 * Shows installation status and progress to user on first run
 */

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ChromeInstallProgressProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChromeInstallProgress: React.FC<ChromeInstallProgressProps> = ({ isOpen, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Checking Chrome installation...');
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    if (!window.electronAPI) return;

    // Listen for progress updates from main process
    const cleanup = window.electronAPI.onChromeInstallProgress((data: { message: string; percent: number }) => {
      setMessage(data.message);
      setProgress(data.percent);

      // Installation complete
      if (data.percent === 100 && data.message.includes('success')) {
        setIsComplete(true);
        // Auto-close after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }

      // Installation failed
      if (data.message.includes('failed') || data.message.includes('error')) {
        setHasError(true);
      }
    });

    return cleanup;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          {isComplete ? (
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          ) : hasError ? (
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto mb-4 bg-neon-blue/10 rounded-full flex items-center justify-center">
              {progress === 0 ? (
                <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
              ) : (
                <Download className="w-8 h-8 text-neon-blue animate-pulse" />
              )}
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-2">
            {isComplete ? 'Installation Complete!' : hasError ? 'Installation Failed' : 'Setting Up Chrome'}
          </h2>

          <p className="text-gray-400 text-sm">
            {message}
          </p>
        </div>

        {/* Progress Bar */}
        {!isComplete && !hasError && (
          <div className="mb-6">
            <div className="w-full h-2 bg-dark-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center mt-2 text-sm text-gray-500">
              {progress}% complete
            </div>
          </div>
        )}

        {/* Info */}
        {!isComplete && !hasError && (
          <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-4">
            <p className="text-gray-300 text-sm text-center">
              <strong>First-time setup:</strong> Downloading Chrome browser for automation.
              <br />
              This may take 1-3 minutes depending on your internet speed.
            </p>
          </div>
        )}

        {/* Error Info */}
        {hasError && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-4">
            <p className="text-red-300 text-sm text-center">
              Automatic installation failed. Please run this command manually:
              <br />
              <code className="bg-dark-900 px-2 py-1 rounded mt-2 inline-block text-xs">
                npx puppeteer browsers install chrome
              </code>
            </p>
          </div>
        )}

        {/* Success Info */}
        {isComplete && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
            <p className="text-green-300 text-sm text-center">
              ✓ Chrome is now installed and ready for automation!
            </p>
          </div>
        )}

        {/* Close Button (only show on error) */}
        {hasError && (
          <button
            onClick={onClose}
            className="w-full mt-4 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default ChromeInstallProgress;
