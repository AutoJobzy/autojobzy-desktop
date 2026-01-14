import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  CreditCard,
  Activity,
  X,
} from 'lucide-react';
import SuperAdminSidebar from '../components/SuperAdminSidebar';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  createdAt: string;
  subscription?: {
    id: string;
    planId: number;
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    plan: {
      name: string;
      price: number;
      durationDays: number;
    };
  };
}

const SuperAdminIndividualUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, statusFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Fetch only individual users (role='user' or 'admin', no instituteId)
      const response = await fetch(`${API_BASE_URL}/superadmin/users?role=user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();

      // Filter to only individual users (no institute affiliation)
      const individualUsers = data.filter((user: User) => !user.instituteId && user.role !== 'superadmin');

      setUsers(individualUsers);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((user) => user.subscription && user.subscription.status === 'active');
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((user) => !user.subscription || user.subscription.status !== 'active');
    }

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Statistics
  const stats = {
    total: users.length,
    activeSubscriptions: users.filter((u) => u.subscription && u.subscription.status === 'active').length,
    expiredSubscriptions: users.filter((u) => u.subscription && u.subscription.status === 'expired').length,
    noSubscription: users.filter((u) => !u.subscription).length,
    totalRevenue: users
      .filter((u) => u.subscription && u.subscription.status === 'active')
      .reduce((sum, u) => sum + (u.subscription?.plan.price || 0), 0),
  };

  if (loading) {
    return (
      <SuperAdminSidebar>
        <div className="min-h-screen bg-dark-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        </div>
      </SuperAdminSidebar>
    );
  }

  return (
    <SuperAdminSidebar>
      <div className="min-h-screen bg-dark-900">
        {/* Header */}
        <div className="bg-dark-800 border-b border-white/10">
          <div className="container mx-auto px-8 py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Users className="w-8 h-8 text-neon-blue" />
                Individual Users Management
              </h1>
              <p className="text-gray-400 mt-1">Manage users with individual subscriptions</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <p className="text-gray-500 text-xs uppercase">Total Users</p>
                </div>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>

              <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-gray-500 text-xs uppercase">Active</p>
                </div>
                <p className="text-green-400 text-2xl font-bold">{stats.activeSubscriptions}</p>
              </div>

              <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <XCircle className="w-5 h-5 text-orange-400" />
                  <p className="text-gray-500 text-xs uppercase">Expired</p>
                </div>
                <p className="text-orange-400 text-2xl font-bold">{stats.expiredSubscriptions}</p>
              </div>

              <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-500 text-xs uppercase">No Subscription</p>
                </div>
                <p className="text-gray-400 text-2xl font-bold">{stats.noSubscription}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <p className="text-green-300 text-xs uppercase">Total Revenue</p>
                </div>
                <p className="text-green-400 text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
              >
                <option value="all">All Users</option>
                <option value="active">Active Subscriptions</option>
                <option value="inactive">Inactive/No Subscription</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="container mx-auto px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>
          )}

          <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-900 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Subscription</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Valid Until</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-dark-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-gray-500 text-xs">{user.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-4 h-4" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <div>
                            <p className="text-white font-medium">{user.subscription.plan.name}</p>
                            <p className="text-gray-500 text-xs">
                              ₹{user.subscription.plan.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500">No subscription</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs border ${user.subscription.status === 'active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : user.subscription.status === 'expired'
                                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}
                          >
                            {user.subscription.status}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription ? (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(user.subscription.endDate)}
                          </div>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription && user.subscription.status === 'active' ? (
                          <div className="flex items-center gap-1 text-green-400 font-semibold">
                            <CreditCard className="w-4 h-4" />
                            ₹{user.subscription.plan.price.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <span className="text-gray-500">₹0</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Calendar className="w-4 h-4" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No users found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
              </div>
            )}

            {/* Results Count */}
            {filteredUsers.length > 0 && (
              <div className="bg-dark-900 border-t border-white/10 px-6 py-3">
                <p className="text-gray-400 text-sm">
                  Showing <span className="text-white font-semibold">{filteredUsers.length}</span> of{' '}
                  <span className="text-white font-semibold">{users.length}</span> users
                </p>
              </div>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">User Details</h2>
                  <p className="text-gray-400 text-sm mt-1">Complete user information</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Personal Information
                  </h3>
                  <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-500 text-xs">First Name</p>
                        <p className="text-white">{selectedUser.firstName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Last Name</p>
                        <p className="text-white">{selectedUser.lastName}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Email</p>
                      <p className="text-white">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">User ID</p>
                      <p className="text-gray-400 font-mono text-sm">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Account Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs border mt-1 ${selectedUser.onboardingCompleted
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          }`}
                      >
                        {selectedUser.onboardingCompleted ? 'Active' : 'Pending Onboarding'}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Joined Date</p>
                      <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Subscription Info */}
                {selectedUser.subscription ? (
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-400" />
                      Subscription Details
                    </h3>
                    <div className="bg-dark-900 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs">Plan Name</p>
                        <p className="text-white font-semibold">{selectedUser.subscription.plan.name}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs">Price</p>
                          <p className="text-green-400 font-bold text-xl">
                            ₹{selectedUser.subscription.plan.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Status</p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs border mt-1 ${selectedUser.subscription.status === 'active'
                              ? 'bg-green-500/10 text-green-400 border-green-500/30'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                              }`}
                          >
                            {selectedUser.subscription.status}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 text-xs">Start Date</p>
                          <p className="text-white">{formatDate(selectedUser.subscription.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">End Date</p>
                          <p className="text-white">{formatDate(selectedUser.subscription.endDate)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Duration</p>
                        <p className="text-white">{selectedUser.subscription.plan.durationDays} days</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      Subscription Details
                    </h3>
                    <div className="bg-dark-900 rounded-lg p-6 text-center">
                      <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">No active subscription</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 bg-dark-900 border border-white/10 text-white rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminSidebar>
  );
};

export default SuperAdminIndividualUsers;
