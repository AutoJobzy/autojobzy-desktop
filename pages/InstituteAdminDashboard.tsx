import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  Package as PackageIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  UserPlus,
  Loader2,
  Search,
  Edit2,
  Trash2,
  Key,
  Power,
  Mail,
  User as UserIcon,
  Lock,
  X,
} from 'lucide-react';
import InstituteAdminSidebar from '../components/InstituteAdminSidebar';

interface DashboardData {
  institute: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    status: string;
  };
  subscription: {
    packageName: string;
    studentLimit: number;
    pricePerMonth: number;
    startDate: string;
    endDate: string;
    status: string;
    paymentStatus: string;
  } | null;
  stats: {
    studentCount: number;
    studentLimit: number;
    remainingSlots: number;
    hasActiveSubscription: boolean;
  };
  staffCount: number;
  adminCount: number;
  canAddStudents: boolean;
  remainingSlots: number;
}

interface Student {
  id: string;
  instituteId: string;
  userId: string;
  enrollmentNumber?: string;
  batch?: string;
  course?: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
    isActive: boolean;
  };
}

type TabType = 'overview' | 'students' | 'staff' | 'subscription' | 'settings';

interface Staff {
  id: string;
  instituteId: string;
  userId: string;
  role: string;
  addedBy: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
  };
  admin: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const InstituteAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffSearchTerm, setStaffSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    enrollmentNumber: '',
    batch: '',
    course: '',
  });

  const [staffFormData, setStaffFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'teacher',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'staff') {
      fetchStaff();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('instituteAdminToken');

      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data.students || data);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message || 'Failed to load students');
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      setStaff(data);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.message || 'Failed to load staff');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add student');
      }

      setSuccess('Student added successfully!');
      setShowAddModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        enrollmentNumber: '',
        batch: '',
        course: '',
      });
      fetchStudents();
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      await fetch(`${API_BASE_URL}/institute-admin/students/${selectedStudent.userId}/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      });

      await fetch(`${API_BASE_URL}/institute-admin/students/${selectedStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollmentNumber: formData.enrollmentNumber,
          batch: formData.batch,
          course: formData.course,
        }),
      });

      setSuccess('Student updated successfully!');
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setError('');
    setSuccess('');

    if (passwordData.password !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(
        `${API_BASE_URL}/institute-admin/students/${selectedStudent.userId}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: passwordData.password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setSelectedStudent(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (
      !confirm(`Are you sure you want to delete ${student.user.firstName} ${student.user.lastName}?`)
    ) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/students/${student.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete student');
      }

      setSuccess('Student deleted successfully!');
      fetchStudents();
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (student: Student) => {
    const action = student.user.isActive ? 'deactivate' : 'activate';
    if (
      !confirm(
        `Are you sure you want to ${action} ${student.user.firstName} ${student.user.lastName}?`
      )
    ) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(
        `${API_BASE_URL}/institute-admin/students/${student.userId}/toggle-active`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to toggle student status');
      }

      const data = await response.json();
      setSuccess(data.message);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      password: '',
      enrollmentNumber: student.enrollmentNumber || '',
      batch: student.batch || '',
      course: student.course || '',
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (student: Student) => {
    setSelectedStudent(student);
    setPasswordData({ password: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(staffFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add staff');
      }

      setSuccess('Staff member added successfully!');
      setShowAddStaffModal(false);
      setStaffFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'teacher',
      });
      fetchStaff();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (
      !confirm(
        `Are you sure you want to remove ${staffMember.user.firstName} ${staffMember.user.lastName} from staff?`
      )
    ) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('instituteAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/institute-admin/staff/${staffMember.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove staff');
      }

      setSuccess('Staff member removed successfully!');
      fetchStaff();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStaff = staff.filter(
    (member) =>
      member.user.firstName.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.user.lastName.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.user.email.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-neon-blue mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="bg-dark-800 border border-red-500/20 rounded-2xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white text-center mb-2">Error</h2>
          <p className="text-gray-400 text-center">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => {
              localStorage.removeItem('instituteAdminToken');
              localStorage.removeItem('instituteAdminUser');
              navigate('/institute-admin/login');
            }}
            className="mt-6 w-full bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const { institute, subscription, stats } = dashboardData!;
  const usagePercentage =
    stats.studentLimit > 0 ? (stats.studentCount / stats.studentLimit) * 100 : 0;

  // Get admin email from localStorage
  const adminUserStr = localStorage.getItem('instituteAdminUser');
  const adminEmail = adminUserStr ? JSON.parse(adminUserStr).email : '';

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <InstituteAdminSidebar
        activeSection={activeTab}
        onSectionChange={setActiveTab}
        instituteName={institute.name}
        adminEmail={adminEmail}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-400 text-sm">{success}</p>
              <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Subscription Alert */}
              {!stats.hasActiveSubscription && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">No Active Subscription</p>
                    <p className="text-red-400/80 text-sm mt-1">
                      Please contact the super admin to activate a subscription package.
                    </p>
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-neon-blue/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-neon-blue/10 rounded-lg">
                      <GraduationCap className="w-6 h-6 text-neon-blue" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Total Students</h3>
                  <p className="text-3xl font-bold text-white">{stats.studentCount}</p>
                  <p className="text-xs text-gray-500 mt-2">of {stats.studentLimit} limit</p>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-neon-purple/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-neon-purple/10 rounded-lg">
                      <Users className="w-6 h-6 text-neon-purple" />
                    </div>
                    {stats.remainingSlots > 0 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Remaining Slots</h3>
                  <p className="text-3xl font-bold text-white">{stats.remainingSlots}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {stats.remainingSlots > 0 ? 'slots available' : 'limit reached'}
                  </p>
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-neon-green/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-neon-green/10 rounded-lg">
                      <PackageIcon className="w-6 h-6 text-neon-green" />
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Current Plan</h3>
                  <p className="text-xl font-bold text-white">
                    {subscription?.packageName || 'No Active Plan'}
                  </p>
                  {subscription && (
                    <p className="text-xs text-gray-500 mt-2">₹{subscription.pricePerMonth}/month</p>
                  )}
                </div>

                <div className="bg-dark-800 border border-white/10 rounded-xl p-6 hover:border-yellow-500/50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">Status</h3>
                  <p className="text-xl font-bold text-white capitalize">{institute.status}</p>
                  {subscription && (
                    <p className="text-xs text-gray-500 mt-2">
                      Valid till {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Student Limit Usage</h3>
                  <span className="text-sm text-gray-400">
                    {stats.studentCount} / {stats.studentLimit} ({usagePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-4 bg-dark-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${usagePercentage >= 100
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : usagePercentage >= 80
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-neon-blue to-neon-purple'
                      }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
                {usagePercentage >= 100 && (
                  <p className="text-red-400 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Student limit reached. Contact super admin to upgrade your plan.
                  </p>
                )}
                {usagePercentage >= 80 && usagePercentage < 100 && (
                  <p className="text-yellow-400 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Approaching student limit. Consider upgrading your plan soon.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Student Management</h2>
                  <p className="text-gray-400 mt-1">
                    {stats.studentCount} / {stats.studentLimit} students
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  disabled={stats.remainingSlots <= 0}
                  className="bg-neon-blue text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Student
                </button>
              </div>

              {stats.remainingSlots <= 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 font-semibold">Student Limit Reached</p>
                    <p className="text-red-400/80 text-sm mt-1">
                      You have reached your plan limit of {stats.studentLimit} students. Contact super
                      admin to upgrade.
                    </p>
                  </div>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or enrollment number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                />
              </div>

              {/* Students Table */}
              <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-900 border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Enrollment No
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Batch
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">
                              {searchTerm ? 'No students found matching your search' : 'No students yet'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="hover:bg-dark-900/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {student.user.firstName[0]}
                                    {student.user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {student.user.firstName} {student.user.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    Added {new Date(student.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{student.user.email}</td>
                            <td className="px-6 py-4 text-gray-400">
                              {student.enrollmentNumber || '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-400">{student.batch || '-'}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${student.user.isActive
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-gray-500/10 text-gray-500'
                                  }`}
                              >
                                {student.user.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditModal(student)}
                                  className="p-2 hover:bg-neon-blue/10 rounded-lg transition-all text-neon-blue"
                                  title="Edit Student"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openPasswordModal(student)}
                                  className="p-2 hover:bg-neon-purple/10 rounded-lg transition-all text-neon-purple"
                                  title="Change Password"
                                >
                                  <Key className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleToggleActive(student)}
                                  className={`p-2 rounded-lg transition-all ${student.user.isActive
                                    ? 'hover:bg-yellow-500/10 text-yellow-500'
                                    : 'hover:bg-green-500/10 text-green-500'
                                    }`}
                                  title={
                                    student.user.isActive ? 'Deactivate Student' : 'Activate Student'
                                  }
                                >
                                  <Power className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(student)}
                                  className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                                  title="Delete Student"
                                >
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
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Staff Management</h2>
                  <p className="text-gray-400 mt-1">{staff.length} staff members</p>
                </div>
                <button
                  onClick={() => setShowAddStaffModal(true)}
                  className="bg-neon-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(188,19,254,0.3)]"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Staff
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={staffSearchTerm}
                  onChange={(e) => setStaffSearchTerm(e.target.value)}
                  className="w-full bg-dark-800 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                />
              </div>

              {/* Staff Table */}
              <div className="bg-dark-800 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-900 border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Added By
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {filteredStaff.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">
                              {staffSearchTerm ? 'No staff found matching your search' : 'No staff members yet'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredStaff.map((member) => (
                          <tr key={member.id} className="hover:bg-dark-900/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-sm">
                                    {member.user.firstName[0]}
                                    {member.user.lastName[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {member.user.firstName} {member.user.lastName}
                                  </p>
                                  <p className="text-gray-500 text-xs">ID: {member.userId.slice(0, 8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-400">{member.user.email}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neon-purple/10 text-neon-purple capitalize">
                                {member.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                              {member.admin.firstName} {member.admin.lastName}
                            </td>
                            <td className="px-6 py-4 text-gray-400">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteStaff(member)}
                                className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
                                title="Remove Staff"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Subscription Details</h2>

              {subscription ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <PackageIcon className="w-6 h-6 text-neon-blue" />
                      Current Package
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Package Name
                        </label>
                        <p className="text-white text-lg mt-1">{subscription.packageName}</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Student Limit
                        </label>
                        <p className="text-white text-lg mt-1">{subscription.studentLimit} students</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Price
                        </label>
                        <p className="text-white text-lg mt-1">₹{subscription.pricePerMonth} / month</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Status
                        </label>
                        <p className="text-white text-lg mt-1 capitalize flex items-center gap-2">
                          {subscription.status === 'active' ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                          {subscription.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-neon-purple" />
                      Subscription Period
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Start Date
                        </label>
                        <p className="text-white text-lg mt-1">
                          {new Date(subscription.startDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          End Date
                        </label>
                        <p className="text-white text-lg mt-1">
                          {new Date(subscription.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Payment Status
                        </label>
                        <p className="text-white text-lg mt-1 capitalize">
                          {subscription.paymentStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-dark-800 border border-white/10 rounded-xl p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-400">
                    Please contact the super admin to activate a subscription package for your institute.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Institute Settings</h2>

              <div className="bg-dark-800 border border-white/10 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-neon-purple" />
                  Institute Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Institute Name
                    </label>
                    <p className="text-white mt-1">{institute.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Email
                    </label>
                    <p className="text-white mt-1">{institute.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Phone
                    </label>
                    <p className="text-white mt-1">{institute.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Website
                    </label>
                    <p className="text-white mt-1">{institute.website || 'Not provided'}</p>
                  </div>
                  {institute.address && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Address
                      </label>
                      <p className="text-white mt-1">{institute.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-neon-blue" />
                Add New Student
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    First Name *
                  </label>
                  <div className="relative mt-2">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Last Name *
                  </label>
                  <div className="relative mt-2">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email *
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Batch
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Course
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-neon-blue" />
                Edit Student
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Enrollment Number
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Batch
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Course
                  </label>
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all mt-2"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neon-blue text-black font-bold py-3 rounded-lg hover:bg-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-neon-purple" />
                Change Password
              </h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <p className="text-gray-400 mb-6">
              Change password for {selectedStudent.user.firstName} {selectedStudent.user.lastName}
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-neon-purple" />
                Add New Staff Member
              </h2>
              <button
                onClick={() => setShowAddStaffModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    First Name *
                  </label>
                  <div className="relative mt-2">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.firstName}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, firstName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Last Name *
                  </label>
                  <div className="relative mt-2">
                    <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.lastName}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Email *
                  </label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.email}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Password *
                  </label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      required
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                      value={staffFormData.password}
                      onChange={(e) =>
                        setStaffFormData({ ...staffFormData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Role *
                  </label>
                  <select
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all mt-2"
                    value={staffFormData.role}
                    onChange={(e) => setStaffFormData({ ...staffFormData, role: e.target.value })}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                    <option value="counselor">Counselor</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="support">Support Staff</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all"
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstituteAdminDashboard;
