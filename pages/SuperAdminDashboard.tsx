import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

interface DashboardStats {
  totalInstitutes: number;
  activeInstitutes: number;
  totalStudents: number;
  totalAdmins: number;
  totalStaff: number;
  activeSubscriptions: number;
  pendingPayments: number;
  totalRevenue: number;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/dashboard-stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Institutes',
      value: stats?.totalInstitutes || 0,
      icon: Building2,
      color: 'blue',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
    },
    {
      title: 'Active Institutes',
      value: stats?.activeInstitutes || 0,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-400',
    },
    {
      title: 'Total Students',
      value: stats?.totalStudents || 0,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: Package,
      color: 'cyan',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-400',
    },
    {
      title: 'Pending Payments',
      value: stats?.pendingPayments || 0,
      icon: Clock,
      color: 'orange',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
    },
    {
      title: 'Institute Admins',
      value: stats?.totalAdmins || 0,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
    },
    {
      title: 'Staff Members',
      value: stats?.totalStaff || 0,
      icon: Users,
      color: 'pink',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
    },
  ];

  return (
    <SuperAdminSidebar>
      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <div className="bg-dark-800 border-b border-white/10">
          <div className="container mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Super Admin Dashboard</h1>
                <p className="text-gray-400">Manage institutes, packages, and subscriptions</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/superadmin/institutes')}
                  className="px-6 py-3 bg-neon-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                >
                  <Building2 className="w-5 h-5 inline mr-2" />
                  Manage Institutes
                </button>
                <button
                  onClick={() => navigate('/superadmin/packages')}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <Package className="w-5 h-5 inline mr-2" />
                  Manage Packages
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="container mx-auto px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <div
                key={index}
                className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="flex items-center justify-between mb-4">
                  <card.icon className={`w-8 h-8 ${card.textColor}`} />
                  <BarChart3 className={`w-5 h-5 ${card.textColor} opacity-50`} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                  <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-dark-800 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/superadmin/institutes?action=create')}
                className="p-4 bg-dark-900 border border-white/10 rounded-lg hover:border-neon-blue transition-colors text-left"
              >
                <Building2 className="w-6 h-6 text-neon-blue mb-2" />
                <h3 className="text-white font-semibold mb-1">Create Institute</h3>
                <p className="text-gray-400 text-sm">Add a new educational institute</p>
              </button>

              <button
                onClick={() => navigate('/superadmin/packages?action=create')}
                className="p-4 bg-dark-900 border border-white/10 rounded-lg hover:border-purple-500 transition-colors text-left"
              >
                <Package className="w-6 h-6 text-purple-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">Create Package</h3>
                <p className="text-gray-400 text-sm">Design new subscription plan</p>
              </button>

              <button
                onClick={() => navigate('/superadmin/institutes')}
                className="p-4 bg-dark-900 border border-white/10 rounded-lg hover:border-green-500 transition-colors text-left"
              >
                <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">View Reports</h3>
                <p className="text-gray-400 text-sm">Institute performance analytics</p>
              </button>
            </div>
          </div>

          {/* Recent Activity Summary */}
          <div className="mt-8 bg-dark-800 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Active Subscriptions</p>
                    <p className="text-gray-400 text-sm">
                      {stats?.activeSubscriptions || 0} institutes with active plans
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-400">
                  {stats?.activeSubscriptions || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Pending Payments</p>
                    <p className="text-gray-400 text-sm">
                      {stats?.pendingPayments || 0} subscriptions awaiting payment
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-400">
                  {stats?.pendingPayments || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Total Revenue</p>
                    <p className="text-gray-400 text-sm">From all paid subscriptions</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-400">
                  ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminSidebar>
  );
};

export default SuperAdminDashboard;
