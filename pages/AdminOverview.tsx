import React, { useEffect, useState } from 'react';
import { Users, UserCheck, UserX, Briefcase, TrendingUp, Calendar } from 'lucide-react';

interface OverviewStats {
  summary: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalApplications: number;
    newUsersThisMonth: number;
    applicationsThisWeek: number;
  };
  planDistribution: Array<{
    plan_name: string;
    price: string;
    user_count: number;
  }>;
  dailyStats: Array<{
    date: string;
    applications: number;
    active_users: number;
  }>;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendUp, color = 'red' }) => {
  const colorClasses = {
    red: 'bg-red-500/10 text-red-500',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
  };

  return (
    <div className="bg-dark-800 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">{value}</div>
        {trend && (
          <div className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/analytics/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <p className="text-red-500">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-400">Overview of platform metrics and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.summary.totalUsers}
          icon={Users}
          trend={`${stats.summary.newUsersThisMonth} this month`}
          trendUp={true}
          color="red"
        />
        <StatCard
          title="Active Users"
          value={stats.summary.activeUsers}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Inactive Users"
          value={stats.summary.inactiveUsers}
          icon={UserX}
          color="orange"
        />
        <StatCard
          title="Total Applications"
          value={stats.summary.totalApplications}
          icon={Briefcase}
          trend={`${stats.summary.applicationsThisWeek} this week`}
          trendUp={true}
          color="blue"
        />
        <StatCard
          title="New Users (30d)"
          value={stats.summary.newUsersThisMonth}
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Applications (7d)"
          value={stats.summary.applicationsThisWeek}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Plan Distribution */}
      <div className="bg-dark-800 border border-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Plan Distribution</h2>
        <div className="space-y-4">
          {stats.planDistribution.map((plan, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
              <div>
                <h3 className="text-white font-medium">{plan.plan_name}</h3>
                <p className="text-sm text-gray-400">₹{parseFloat(plan.price).toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{plan.user_count}</p>
                <p className="text-sm text-gray-400">users</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity (Last 7 Days)</h2>
        <div className="space-y-3">
          {stats.dailyStats.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-400">{day.active_users} active users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">{day.applications}</p>
                <p className="text-sm text-gray-400">applications</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
