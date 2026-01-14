import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink,
  Send,
  Activity,
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw,
} from 'lucide-react';

interface DailyTrend {
  date: string;
  total: number;
  applied: number;
  skipped: number;
}

interface AnalyticsStats {
  totalApplications: number;
  todayApplications: number;
  applied: number;
  skipped: number;
  directApply: number;
  externalApply: number;
  noApplyButton: number;
  successRate: number;
  goodMatches: number;
  poorMatches: number;
  avgMatchScore: string;
  earlyApplicantCount: number;
  keySkillsMatchCount: number;
  locationMatchCount: number;
  experienceMatchCount: number;
  dailyTrend: DailyTrend[];
}

const UserAnalytics: React.FC = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      let url = `${API_BASE_URL}/job-results/stats`;

      // Add date range filter if not 'all'
      if (dateRange !== 'all') {
        const daysAgo = dateRange === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        url += `?startDate=${startDate.toISOString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-neon-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-2">Failed to load analytics</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Activity,
      color: 'blue',
      change: stats.todayApplications > 0 ? `+${stats.todayApplications} today` : 'No activity today',
    },
    {
      title: 'Applied',
      value: stats.applied,
      icon: CheckCircle,
      color: 'green',
      percentage: stats.totalApplications > 0 ? Math.round((stats.applied / stats.totalApplications) * 100) : 0,
    },
    {
      title: 'Skipped',
      value: stats.skipped,
      icon: XCircle,
      color: 'orange',
      percentage: stats.totalApplications > 0 ? Math.round((stats.skipped / stats.totalApplications) * 100) : 0,
    },
    {
      title: 'Direct Apply',
      value: stats.directApply,
      icon: Send,
      color: 'purple',
      percentage: stats.applied > 0 ? Math.round((stats.directApply / stats.applied) * 100) : 0,
    },
    {
      title: 'External Apply',
      value: stats.externalApply,
      icon: ExternalLink,
      color: 'pink',
      percentage: stats.applied > 0 ? Math.round((stats.externalApply / stats.applied) * 100) : 0,
    },
    {
      title: 'Good Matches',
      value: stats.goodMatches,
      icon: TrendingUp,
      color: 'emerald',
      change: `${stats.successRate}% success rate`,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    };
    return colors[color] || colors.blue;
  };

  const maxTrendValue = Math.max(...stats.dailyTrend.map(d => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Header with Date Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Activity Dashboard</h2>
          <p className="text-gray-400 text-sm">Track your job application analytics and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | 'all')}
            className="bg-dark-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const colors = getColorClasses(card.color);

          return (
            <div
              key={card.title}
              className={`${colors.bg} border ${colors.border} rounded-xl p-6 transition-all hover:scale-105`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                  <h3 className="text-4xl font-bold text-white">{card.value.toLocaleString()}</h3>
                </div>
                <div className={`p-3 ${colors.bg} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>

              {card.percentage !== undefined && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-dark-900/50 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} ${colors.text}`}
                      style={{ width: `${card.percentage}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold ${colors.text}`}>{card.percentage}%</span>
                </div>
              )}

              {card.change && (
                <p className="text-sm text-gray-400 mt-2">{card.change}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Trend Chart */}
      <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Application Trend (Last 7 Days)</h3>
            <p className="text-gray-400 text-sm">Daily breakdown of applied and skipped applications</p>
          </div>
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>

        <div className="space-y-3">
          {stats.dailyTrend.map((day) => {
            const appliedPercentage = day.total > 0 ? (day.applied / maxTrendValue) * 100 : 0;
            const skippedPercentage = day.total > 0 ? (day.skipped / maxTrendValue) * 100 : 0;

            return (
              <div key={day.date} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 font-medium">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-400 text-xs">Applied: {day.applied}</span>
                    <span className="text-orange-400 text-xs">Skipped: {day.skipped}</span>
                    <span className="text-gray-400 text-xs font-semibold">Total: {day.total}</span>
                  </div>
                </div>

                <div className="flex gap-1 h-8">
                  {day.applied > 0 && (
                    <div
                      className="bg-green-500/30 border border-green-500/50 rounded"
                      style={{ width: `${appliedPercentage}%` }}
                      title={`Applied: ${day.applied}`}
                    ></div>
                  )}
                  {day.skipped > 0 && (
                    <div
                      className="bg-orange-500/30 border border-orange-500/50 rounded"
                      style={{ width: `${skippedPercentage}%` }}
                      title={`Skipped: ${day.skipped}`}
                    ></div>
                  )}
                  {day.total === 0 && (
                    <div className="flex-1 bg-dark-900/50 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-600">No activity</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Match Quality Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Match Quality */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Match Quality</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Avg Match Score</span>
              <span className="text-2xl font-bold text-white">{stats.avgMatchScore}/5.0</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-green-400">Good Matches</span>
                  <span className="text-white font-semibold">{stats.goodMatches}</span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full"
                    style={{
                      width: `${stats.totalApplications > 0 ? (stats.goodMatches / stats.totalApplications) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-red-400">Poor Matches</span>
                  <span className="text-white font-semibold">{stats.poorMatches}</span>
                </div>
                <div className="w-full bg-dark-900 rounded-full h-2">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{
                      width: `${stats.totalApplications > 0 ? (stats.poorMatches / stats.totalApplications) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Match Criteria */}
        <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Match Criteria</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Early Applicant</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.earlyApplicantCount}</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Skills Match</p>
              <p className="text-2xl font-bold text-blue-400">{stats.keySkillsMatchCount}</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Location Match</p>
              <p className="text-2xl font-bold text-purple-400">{stats.locationMatchCount}</p>
            </div>
            <div className="bg-dark-900 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Experience Match</p>
              <p className="text-2xl font-bold text-pink-400">{stats.experienceMatchCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAnalytics;
