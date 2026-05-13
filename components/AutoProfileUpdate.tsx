/**
 * ======================== AUTO PROFILE UPDATE COMPONENT ========================
 * Allows users to refresh their Naukri resume headline to keep profile fresh
 * Calls backend API which executes Puppeteer script
 */

import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Loader2, Play, Square } from 'lucide-react';
import toast from 'react-hot-toast';

// API Base URL - defaults to localhost for desktop app
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

interface UpdateStatus {
  status: 'idle' | 'running' | 'success' | 'failed';
  message: string;
  lastUpdate: string | null;
  executedAt: string | null;
}

const AutoProfileUpdate: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    status: 'idle',
    message: '',
    lastUpdate: null,
    executedAt: null
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch last update status on component mount
  useEffect(() => {
    fetchLastUpdateStatus();
  }, []);

  const fetchLastUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/profile-update/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success && data.lastUpdate) {
        setUpdateStatus(prev => ({
          ...prev,
          lastUpdate: data.lastUpdate,
          message: 'Profile previously updated'
        }));
      }
    } catch (error: any) {
      console.error('Failed to fetch last update status:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setLogs([]);
    setUpdateStatus({
      status: 'running',
      message: 'Starting profile update...',
      lastUpdate: updateStatus.lastUpdate,
      executedAt: null
    });

    const addLog = (message: string, type: string = 'info') => {
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
      }]);
    };

    addLog('🚀 Bhai, Circuit profile update karne ki taiyari kar raha hai — ekdum solid plan hai!', 'info');

    const loadingToast = toast.loading('Updating your Naukri profile...');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required. Please login again.');

      const isElectron = (window as any).electron && (window as any).electron.isElectron;

      let data;

      if (isElectron) {
        addLog('🖥️  Bhai, local Electron mein chal raha hai... apun ka apna jugaad!', 'info');

        // Remove any stale listeners before adding a new one
        (window as any).electron.removeProfileUpdateLogListener?.();

        const logSub = (window as any).electron.onProfileUpdateLog?.((log: any) => {
          setLogs(prev => [...prev, {
            timestamp: log.timestamp || new Date().toLocaleTimeString(),
            message: log.message,
            type: log.type || 'info',
          }]);
        });

        data = await (window as any).electron.startProfileUpdate({ token, apiBaseUrl: API_BASE_URL });

        // Clean up listener after done
        if (logSub) (window as any).electron.removeProfileUpdateLogListener?.(logSub);
      } else {
        addLog('🌐 Bhai, API se chal raha hai... remote wala scene!', 'info');

        const response = await fetch(`${API_BASE_URL}/profile-update/naukri/update-resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        data = await response.json();
      }

      if (data.success) {
        toast.success('Profile updated successfully!', { id: loadingToast });
        addLog('✅ Bhai, profile ekdum mast update ho gaya! Jaadoo ki jhappi Naukri ko!', 'success');
        setUpdateStatus({
          status: 'success',
          message: data.message || 'Resume headline updated successfully',
          lastUpdate: new Date().toISOString(),
          executedAt: data.executedAt || new Date().toISOString()
        });

        if (data.logs && Array.isArray(data.logs)) {
          data.logs.forEach((l: any) => {
            const msg = typeof l === 'string' ? l : l.message;
            if (msg) addLog(msg, l.type || 'info');
          });
        }

        fetchLastUpdateStatus();
      } else {
        throw new Error(data.error || data.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile', { id: loadingToast });
      addLog(`❌ Aye bhai, bada scene ho gaya: ${error.message} — tension nahi, phir try karte hai!`, 'error');
      setUpdateStatus({
        status: 'failed',
        message: error.message || 'Profile update failed',
        lastUpdate: updateStatus.lastUpdate,
        executedAt: new Date().toISOString()
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStopUpdate = async () => {
    const electronAPI = (window as any).electronAPI || (window as any).electron;
    if (electronAPI?.stopProfileUpdate) {
      await electronAPI.stopProfileUpdate().catch(() => {});
    }
    setIsUpdating(false);
    setUpdateStatus(prev => ({ ...prev, status: 'idle', message: 'Stopped by user' }));
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message: '🛑 Profile update stopped by user.',
      type: 'warning',
    }]);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Info card */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(168,85,247,0.05)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">Naukri Auto Profile Update</h3>
            <p className="text-sm text-gray-400">
              Keeps your Naukri profile active by refreshing your resume headline.
              The bot logs in with your saved credentials and adds an invisible change to your headline,
              making your profile appear recently updated and boosting recruiter visibility.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">How It Works</span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm text-gray-500">
            {[
              'Logs in using your saved Naukri credentials',
              'Opens your profile and edits the resume headline',
              'Appends an invisible space (no visible change)',
              'Saves — making your profile appear "recently updated"',
              'Boosts visibility in recruiter searches',
            ].map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-purple-500 font-bold flex-shrink-0">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {updateStatus.lastUpdate && (
        <div className="flex items-center gap-3 text-sm text-gray-500 font-mono">
          <Clock className="w-4 h-4 text-gray-600" />
          Last updated: <span className="text-gray-400">{formatDate(updateStatus.lastUpdate)}</span>
          {updateStatus.status === 'success' && <CheckCircle className="w-4 h-4 text-green-400 ml-1" />}
          {updateStatus.status === 'failed' && <XCircle className="w-4 h-4 text-red-400 ml-1" />}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        {!isUpdating ? (
          <button
            onClick={handleUpdateProfile}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-bold rounded-xl hover:from-purple-400 hover:to-violet-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
          >
            <Play className="w-4 h-4 fill-current" /> Update Profile Now
          </button>
        ) : (
          <button
            onClick={handleStopUpdate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-bold rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
          >
            <Square className="w-4 h-4 fill-current" /> Stop
          </button>
        )}
        {isUpdating && (
          <div className="flex items-center gap-2 text-purple-400 text-sm font-mono">
            <Loader2 className="w-4 h-4 animate-spin" /> Running...
          </div>
        )}
        {updateStatus.status === 'success' && !isUpdating && (
          <div className="flex items-center gap-2 text-green-400 text-sm font-mono">
            <CheckCircle className="w-4 h-4" /> Update successful
          </div>
        )}
        {updateStatus.message === 'Stopped by user' && !isUpdating && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
            <Square className="w-4 h-4 fill-current" /> Stopped
          </div>
        )}
      </div>

      {/* Log terminal */}
      <div className="bg-black rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isUpdating ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'}`}></div>
            Profile Update Logs {logs.length > 0 && `(${logs.length})`}
          </span>
          <span className="text-xs text-gray-600 font-mono">profileUpdateBot.mjs</span>
        </div>
        <div
          ref={logContainerRef}
          className="h-72 overflow-y-auto p-6 font-mono text-sm space-y-2 bg-black text-gray-300"
        >
          {logs.length === 0 && (
            <div className="text-gray-600 italic">
              Click 'Update Profile Now' to begin.
            </div>
          )}
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`${
                log.type === 'error' ? 'text-red-400' :
                log.type === 'success' ? 'text-green-400' :
                log.type === 'warning' ? 'text-yellow-400' :
                'text-gray-300'
              } break-words font-mono leading-relaxed flex gap-3 p-1 rounded hover:bg-white/5`}
            >
              <span className="opacity-40 text-xs w-20 shrink-0 pt-0.5">{log.timestamp}</span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
          {isUpdating && (
            <div className="flex items-center gap-2 text-purple-400 mt-2 animate-pulse pl-[5.5rem]">
              <span className="w-2 h-4 bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AutoProfileUpdate;
