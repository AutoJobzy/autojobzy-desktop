/**
 * ======================== AUTO PROFILE UPDATE COMPONENT ========================
 * Allows users to refresh their Naukri resume headline to keep profile fresh
 * Calls backend API which executes Puppeteer script
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
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
  const [logs, setLogs] = useState<string[]>([]);

  // Fetch last update status on component mount
  useEffect(() => {
    fetchLastUpdateStatus();
  }, []);

  /**
   * Fetch last update status from backend
   */
  const fetchLastUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile-update/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  /**
   * Handle Update Profile button click
   */
  const handleUpdateProfile = async () => {
    // Reset state
    setIsUpdating(true);
    setLogs([]);
    setUpdateStatus({
      status: 'running',
      message: 'Starting profile update...',
      lastUpdate: updateStatus.lastUpdate,
      executedAt: null
    });

    const loadingToast = toast.loading('Updating your Naukri profile...');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/profile-update/naukri/update-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!', { id: loadingToast });
        setUpdateStatus({
          status: 'success',
          message: data.message || 'Resume headline updated successfully',
          lastUpdate: new Date().toISOString(),
          executedAt: data.executedAt
        });

        // Update logs if provided
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }

        // Refresh last update status
        fetchLastUpdateStatus();
      } else {
        throw new Error(data.error || data.message || 'Profile update failed');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile', { id: loadingToast });

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

  /**
   * Format date for display
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get status icon based on current status
   */
  const getStatusIcon = () => {
    switch (updateStatus.status) {
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  /**
   * Get status color classes
   */
  const getStatusColor = () => {
    switch (updateStatus.status) {
      case 'running':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'failed':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw className="w-7 h-7 text-neon-blue" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Auto Profile Update
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Keep your Naukri profile active by refreshing your resume headline. This increases your profile visibility and helps you appear in more recruiter searches.
        </p>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl p-6 border-2 ${getStatusColor()} transition-all duration-300`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {updateStatus.status === 'idle' && 'Ready to Update'}
              {updateStatus.status === 'running' && 'Update in Progress'}
              {updateStatus.status === 'success' && 'Update Successful'}
              {updateStatus.status === 'failed' && 'Update Failed'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {updateStatus.message || 'Click the button below to update your Naukri profile'}
            </p>

            {/* Last Update Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  <strong>Last updated:</strong> {formatDate(updateStatus.lastUpdate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${isUpdating
            ? 'bg-gray-400 cursor-not-allowed text-gray-700'
            : 'bg-gradient-to-r from-neon-blue to-blue-500 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
            }`}
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Updating Profile...
            </>
          ) : (
            <>
              <RefreshCw className="w-6 h-6" />
              Update Profile Now
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
          This will append a space to your resume headline, making your profile appear recently updated
        </p>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-dark-800 rounded-xl p-6 border border-gray-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-neon-blue" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            How It Works
          </h3>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex gap-3">
            <span className="font-semibold text-neon-blue flex-shrink-0">1.</span>
            <p>Connects to your Naukri account using your saved credentials</p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-neon-blue flex-shrink-0">2.</span>
            <p>Opens your profile page and edits the resume headline</p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-neon-blue flex-shrink-0">3.</span>
            <p>Adds a space to your headline (invisible change)</p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-neon-blue flex-shrink-0">4.</span>
            <p>Saves the change, making your profile appear "recently updated"</p>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-neon-blue flex-shrink-0">5.</span>
            <p>This increases your visibility in recruiter searches</p>
          </div>
        </div>
      </div>

      {/* Logs (only show if there are logs) */}
      {logs.length > 0 && (
        <div className="bg-black rounded-xl p-6 border border-gray-700 shadow-sm">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Update Logs
          </h3>
          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 max-h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="py-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoProfileUpdate;
