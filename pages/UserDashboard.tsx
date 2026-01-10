import React, { useState } from 'react';
import { ArrowLeft, BarChart3, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAnalytics from '../components/UserAnalytics';
import ApplicationHistory from './ApplicationHistory';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'analytics' | 'history'>('analytics');

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">My Activity</h1>
              <p className="text-gray-400">Track your job application analytics and history</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-dark-800 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === 'analytics'
                  ? 'bg-neon-blue text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeView === 'history'
                  ? 'bg-neon-blue text-black font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'analytics' ? <UserAnalytics /> : <ApplicationHistory />}
      </div>
    </div>
  );
};

export default UserDashboard;
