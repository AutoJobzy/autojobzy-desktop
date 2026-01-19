import React, { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, CreditCard, Trash2, RefreshCw, Plus, Edit2, Key, X, Eye, Calendar, Activity, Target, TrendingUp } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  subscription: {
    plan_name: string;
    status: string;
  } | null;
  totalApplications: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
}

interface UserDetail {
  user: User & {
    updatedAt: string;
  };
  subscriptions: Array<{
    id: string;
    plan_name: string;
    plan_price: string;
    status: string;
    start_date: string;
    end_date: string;
    created_at: string;
  }>;
  jobSettings: {
    id: string;
    job_title: string;
    job_locations: string;
    experience_min: number;
    experience_max: number;
    salary_min: number;
    salary_max: number;
    remote_preference: string;
  } | null;
  applicationStats: {
    total_applications: number;
    good_matches: number;
    direct_applies: number;
    last_application: string;
  };
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true,
    role: 'user'
  });
  const [newPassword, setNewPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [planDuration, setPlanDuration] = useState(30);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [page, search, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        status: statusFilter,
        role: 'user',
      });

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/plans`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.filter((p: Plan & { isActive: boolean }) => p.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const createUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('User created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to create user: ${error.error}`);
      }
    } catch (error) {
      alert('Failed to create user');
    }
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('User updated successfully!');
        setShowEditModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const resetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert('Password reset successfully!');
        setShowPasswordModal(false);
        setNewPassword('');
      }
    } catch (error) {
      alert('Failed to reset password');
    }
  };

  const assignPlan = async () => {
    if (!selectedUser || !selectedPlan) return;

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + planDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/change-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: selectedPlan, startDate, endDate }),
      });

      if (response.ok) {
        alert('Plan assigned successfully!');
        setShowPlanModal(false);
        setSelectedPlan('');
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to assign plan');
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) fetchUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        alert('User deleted successfully!');
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      isActive: user.isActive,
      role: user.role
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const openPlanModal = (user: User) => {
    setSelectedUser(user);
    setSelectedPlan('');
    setPlanDuration(30);
    setShowPlanModal(true);
  };

  const openDetailModal = async (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setLoadingDetail(true);

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetail(data);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      isActive: true,
      role: 'user'
    });
    setSelectedUser(null);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-gray-400">Full CRUD control over all users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg text-white font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-white/10 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email or name..."
              className="w-full pl-11 pr-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-900 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applications</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {user.isActive ? <><UserCheck className="w-3 h-3" />Active</> : <><UserX className="w-3 h-3" />Inactive</>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{user.subscription ? user.subscription.plan_name : 'No Plan'}</div>
                      {user.subscription && <div className="text-xs text-gray-400">{user.subscription.status}</div>}
                    </td>
                    <td className="px-6 py-4"><div className="text-sm text-white">{user.totalApplications}</div></td>
                    <td className="px-6 py-4"><div className="text-sm text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</div></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openDetailModal(user)} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-all" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditModal(user)} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => openPasswordModal(user)} className="p-2 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-all" title="Reset Password">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => openPlanModal(user)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all" title="Assign Plan">
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleUserStatus(user.id, user.isActive)} className={`p-2 rounded-lg transition-all ${user.isActive ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'}`} title={user.isActive ? 'Deactivate' : 'Activate'}>
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-all">Previous</button>
            <span className="text-gray-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-all">Next</button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Create User</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                <label className="text-sm text-gray-300">Active User</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all">Cancel</button>
              <button onClick={createUser} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-medium transition-all">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                <label className="text-sm text-gray-300">Active User</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all">Cancel</button>
              <button onClick={updateUser} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-medium transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-gray-400 mb-4">Resetting password for: <span className="text-white font-medium">{selectedUser.email}</span></p>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" placeholder="Enter new password" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all">Cancel</button>
              <button onClick={resetPassword} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-medium transition-all">Reset Password</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Plan Modal */}
      {showPlanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Assign Plan</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-gray-400 mb-4">Assigning plan to: <span className="text-white font-medium">{selectedUser.email}</span></p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Plan</label>
                <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500">
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>{plan.name} - ₹{plan.price} ({plan.durationDays} days)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Duration (days)</label>
                <input type="number" value={planDuration} onChange={(e) => setPlanDuration(parseInt(e.target.value))} className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500" min="1" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all">Cancel</button>
              <button onClick={assignPlan} disabled={!selectedPlan} className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-medium transition-all disabled:opacity-50">Assign Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">User Profile Details</h2>
              <button onClick={() => { setShowDetailModal(false); setUserDetail(null); }} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-2 text-gray-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading user details...
                </div>
              </div>
            ) : userDetail ? (
              <div className="space-y-6">
                {/* Basic Info Section */}
                <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-red-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Full Name</p>
                      <p className="text-white font-medium">{userDetail.user.firstName} {userDetail.user.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email</p>
                      <p className="text-white font-medium">{userDetail.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone</p>
                      <p className="text-white font-medium">{userDetail.user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Account Status</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${userDetail.user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {userDetail.user.isActive ? <><UserCheck className="w-3 h-3" />Active</> : <><UserX className="w-3 h-3" />Inactive</>}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">User ID</p>
                      <p className="text-white font-mono text-xs">{userDetail.user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Role</p>
                      <p className="text-white font-medium capitalize">{userDetail.user.role}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Account Created
                      </p>
                      <p className="text-white">{new Date(userDetail.user.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Last Updated
                      </p>
                      <p className="text-white">{new Date(userDetail.user.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Application Statistics */}
                <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    Application Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-500" />
                        <p className="text-sm text-gray-400">Total Applications</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{userDetail.applicationStats.total_applications || 0}</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        <p className="text-sm text-gray-400">Good Matches</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{userDetail.applicationStats.good_matches || 0}</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        <p className="text-sm text-gray-400">Direct Applies</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{userDetail.applicationStats.direct_applies || 0}</p>
                    </div>
                    <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-orange-500" />
                        <p className="text-sm text-gray-400">Last Application</p>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {userDetail.applicationStats.last_application
                          ? new Date(userDetail.applicationStats.last_application).toLocaleDateString()
                          : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subscription History */}
                <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-red-500" />
                    Subscription History
                  </h3>
                  {userDetail.subscriptions.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {userDetail.subscriptions.map((sub) => (
                        <div key={sub.id} className="bg-dark-800 border border-white/10 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-white font-semibold">{sub.plan_name}</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'active'
                                  ? 'bg-green-500/10 text-green-500'
                                  : sub.status === 'expired'
                                    ? 'bg-red-500/10 text-red-500'
                                    : 'bg-gray-500/10 text-gray-500'
                                  }`}>
                                  {sub.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-400">Price: </span>
                                  <span className="text-white">₹{sub.plan_price}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Start: </span>
                                  <span className="text-white">{new Date(sub.start_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">End: </span>
                                  <span className="text-white">{new Date(sub.end_date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Purchased: </span>
                                  <span className="text-white">{new Date(sub.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No subscription history</p>
                    </div>
                  )}
                </div>

                {/* Job Settings */}
                {userDetail.jobSettings && (
                  <div className="bg-dark-900 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-red-500" />
                      Job Preferences
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Job Title</p>
                        <p className="text-white font-medium">{userDetail.jobSettings.job_title || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Locations</p>
                        <p className="text-white font-medium">{userDetail.jobSettings.job_locations || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Experience Range</p>
                        <p className="text-white font-medium">
                          {userDetail.jobSettings.experience_min} - {userDetail.jobSettings.experience_max} years
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Salary Range</p>
                        <p className="text-white font-medium">
                          ₹{userDetail.jobSettings.salary_min} - ₹{userDetail.jobSettings.salary_max} LPA
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Remote Preference</p>
                        <p className="text-white font-medium capitalize">{userDetail.jobSettings.remote_preference || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => { setShowDetailModal(false); openEditModal(selectedUser); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit User
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); openPasswordModal(selectedUser); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 text-purple-500 rounded-lg hover:bg-purple-500/20 transition-all"
                  >
                    <Key className="w-4 h-4" />
                    Reset Password
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); openPlanModal(selectedUser); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    Assign Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Failed to load user details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
