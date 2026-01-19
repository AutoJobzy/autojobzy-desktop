import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  Search,
  Filter,
  ArrowLeft,
  Mail,
  Calendar,
  Building2,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  Briefcase,
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'institute_admin' | 'staff' | 'student';
  instituteId: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
}

const SuperAdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [instituteFilter, setInstituteFilter] = useState<string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'individual' | 'institute'>('all');

  useEffect(() => {
    fetchUsers();
    fetchInstitutes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, roleFilter, instituteFilter, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      setLoading(false);
    }
  };

  const fetchInstitutes = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutes(data);
      }
    } catch (err) {
      console.error('Failed to fetch institutes:', err);
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

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Institute filter
    if (instituteFilter !== 'all') {
      filtered = filtered.filter((user) => user.instituteId === instituteFilter);
    }

    // User type filter
    if (userTypeFilter === 'individual') {
      filtered = filtered.filter((user) => !user.instituteId && (user.role === 'user' || user.role === 'admin'));
    } else if (userTypeFilter === 'institute') {
      filtered = filtered.filter(
        (user) => user.instituteId || user.role === 'institute_admin' || user.role === 'staff' || user.role === 'student'
      );
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="w-5 h-5 text-purple-400" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'institute_admin':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      case 'staff':
        return <Briefcase className="w-5 h-5 text-green-400" />;
      case 'student':
        return <GraduationCap className="w-5 h-5 text-orange-400" />;
      default:
        return <UsersIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'admin':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'institute_admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'staff':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'student':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInstituteName = (instituteId: string | null) => {
    if (!instituteId) return 'Individual User';
    const institute = institutes.find((inst) => inst.id === instituteId);
    return institute ? institute.name : 'Unknown Institute';
  };

  // Statistics
  const stats = {
    total: users.length,
    individual: users.filter((u) => !u.instituteId && (u.role === 'user' || u.role === 'admin')).length,
    instituteUsers: users.filter(
      (u) => u.instituteId || u.role === 'institute_admin' || u.role === 'staff' || u.role === 'student'
    ).length,
    admins: users.filter((u) => u.role === 'admin' || u.role === 'superadmin' || u.role === 'institute_admin')
      .length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-white/10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <UsersIcon className="w-8 h-8 text-neon-blue" />
                User Management
              </h1>
              <p className="text-gray-400 mt-1">View and manage all platform users</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-500 text-xs uppercase">Total Users</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-500 text-xs uppercase">Individual Users</p>
              <p className="text-neon-blue text-2xl font-bold">{stats.individual}</p>
            </div>
            <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-500 text-xs uppercase">Institute Users</p>
              <p className="text-purple-400 text-2xl font-bold">{stats.instituteUsers}</p>
            </div>
            <div className="bg-dark-900 border border-white/10 rounded-lg p-4">
              <p className="text-gray-500 text-xs uppercase">Total Admins</p>
              <p className="text-red-400 text-2xl font-bold">{stats.admins}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
              />
            </div>

            {/* User Type Filter */}
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value as any)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All User Types</option>
              <option value="individual">Individual Users</option>
              <option value="institute">Institute Users</option>
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
              <option value="institute_admin">Institute Admin</option>
              <option value="staff">Staff</option>
              <option value="student">Student</option>
            </select>

            {/* Institute Filter */}
            <select
              value={instituteFilter}
              onChange={(e) => setInstituteFilter(e.target.value)}
              className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
            >
              <option value="all">All Institutes</option>
              <option value="null">Individual (No Institute)</option>
              {institutes.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name}
                </option>
              ))}
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Institute</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(user.role)}
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
                      <span className={`inline-block px-3 py-1 rounded-full text-xs border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs border ${user.instituteId
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                      >
                        {user.instituteId ? 'Institute' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        {user.instituteId && <Building2 className="w-4 h-4" />}
                        <span className="text-sm">{getInstituteName(user.instituteId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.onboardingCompleted ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <UserCheck className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-400 text-sm">
                          <UserX className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
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
    </div>
  );
};

export default SuperAdminUsers;
