import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package as PackageIcon,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  ArrowLeft,
  User,
  Building2,
  Filter,
} from 'lucide-react';

interface Package {
  id: number;
  name: string;
  description: string;
  studentLimit: number;
  pricePerMonth: number;
  features: {
    job_automation?: boolean;
    resume_builder?: boolean;
    skill_tracking?: boolean;
    analytics?: boolean;
    support?: string;
    [key: string]: any;
  };
  type: 'individual' | 'institute';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const SuperAdminPackages: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'individual' | 'institute'>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    studentLimit: 500,
    pricePerMonth: 60000,
    type: 'institute' as 'individual' | 'institute',
    features: {
      job_automation: true,
      resume_builder: true,
      skill_tracking: true,
      analytics: true,
      support: 'Email & Phone',
    },
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/packages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }

      const data = await response.json();
      setPackages(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load packages');
      setLoading(false);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create package');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);

      setShowCreateModal(false);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/packages/${editingPackage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          isActive: editingPackage.isActive,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update package');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);

      setShowEditModal(false);
      setEditingPackage(null);
      resetForm();
      fetchPackages();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/packages/${pkg.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...pkg,
          isActive: !pkg.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update package status');
      }

      fetchPackages();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleDeletePackage = async (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/packages/${pkg.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete package');
      }

      const data = await response.json();
      alert(`✅ ${data.message}`);
      fetchPackages();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      studentLimit: pkg.studentLimit,
      pricePerMonth: pkg.pricePerMonth,
      type: pkg.type,
      features: pkg.features,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      studentLimit: 500,
      pricePerMonth: 60000,
      type: 'institute',
      features: {
        job_automation: true,
        resume_builder: true,
        skill_tracking: true,
        analytics: true,
        support: 'Email & Phone',
      },
    });
  };

  // Filter packages based on type
  const filteredPackages = packages.filter((pkg) => {
    if (filterType === 'all') return true;
    return pkg.type === filterType;
  });

  if (loading && packages.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="p-2 bg-dark-800 border border-white/10 rounded-lg hover:bg-dark-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <PackageIcon className="w-8 h-8 text-purple-500" />
                Package Management
              </h1>
              <p className="text-gray-400 mt-1">Manage subscription packages for individuals and institutes</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Create Package
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-all ${filterType === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-dark-800 border border-white/10 text-gray-400 hover:text-white'
                }`}
            >
              All Packages ({packages.length})
            </button>
            <button
              onClick={() => setFilterType('individual')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${filterType === 'individual'
                ? 'bg-blue-500 text-white'
                : 'bg-dark-800 border border-white/10 text-gray-400 hover:text-white'
                }`}
            >
              <User className="w-4 h-4" />
              Individual ({packages.filter(p => p.type === 'individual').length})
            </button>
            <button
              onClick={() => setFilterType('institute')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${filterType === 'institute'
                ? 'bg-green-500 text-white'
                : 'bg-dark-800 border border-white/10 text-gray-400 hover:text-white'
                }`}
            >
              <Building2 className="w-4 h-4" />
              Institute ({packages.filter(p => p.type === 'institute').length})
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-dark-800 border ${pkg.isActive ? 'border-purple-500/30' : 'border-white/10'
              } rounded-lg p-6 hover:border-purple-500 transition-all`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${pkg.type === 'individual'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}
                  >
                    {pkg.type === 'individual' ? (
                      <>
                        <User className="w-3 h-3" />
                        Individual
                      </>
                    ) : (
                      <>
                        <Building2 className="w-3 h-3" />
                        Institute
                      </>
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{pkg.description}</p>
              </div>
              {pkg.isActive ? (
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="text-3xl font-bold text-purple-400">
                ₹{pkg.pricePerMonth.toLocaleString('en-IN')}
                <span className="text-sm text-gray-400 font-normal">/month</span>
              </div>
            </div>

            {/* Student Limit */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-dark-900 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-white">
                Up to <strong>{pkg.studentLimit}</strong> students
              </span>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
              <p className="text-xs text-gray-500 uppercase font-semibold">Features:</p>
              {Object.entries(pkg.features || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    {typeof value === 'string' && value !== 'true' && `: ${value}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(pkg)}
                className="flex-1 px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(pkg)}
                className={`flex-1 px-4 py-2 border rounded-lg transition-colors flex items-center justify-center gap-2 ${pkg.isActive
                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                  }`}
              >
                {pkg.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDeletePackage(pkg)}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && !loading && (
        <div className="max-w-7xl mx-auto text-center py-12">
          <PackageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {packages.length === 0
              ? 'No packages found. Create your first package!'
              : `No ${filterType} packages found.`}
          </p>
        </div>
      )}

      {/* Create Package Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Package</h2>
            <form onSubmit={handleCreatePackage} className="space-y-4">
              {/* Package Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Package Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'individual' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'individual'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-white/10 bg-dark-900 text-gray-400 hover:border-blue-500/50'
                      }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Individual</p>
                    <p className="text-xs mt-1">For personal users</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'institute' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'institute'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-white/10 bg-dark-900 text-gray-400 hover:border-green-500/50'
                      }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Institute</p>
                    <p className="text-xs mt-1">For institutions</p>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Package Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Basic Plan"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Brief description of the package"
                  required
                />
              </div>

              {/* Student Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Student Limit</label>
                <input
                  type="number"
                  value={formData.studentLimit}
                  onChange={(e) => setFormData({ ...formData, studentLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  min="1"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price per Month (₹)</label>
                <input
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  min="0"
                  required
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.features.job_automation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, job_automation: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    Job Automation
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.features.resume_builder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, resume_builder: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    Resume Builder
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.features.skill_tracking}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, skill_tracking: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    Skill Tracking
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={formData.features.analytics}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, analytics: e.target.checked },
                        })
                      }
                      className="w-4 h-4"
                    />
                    Analytics
                  </label>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Support Type</label>
                    <input
                      type="text"
                      value={formData.features.support}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          features: { ...formData.features, support: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="e.g., Email & Phone"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-dark-900 border border-white/10 text-white rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && editingPackage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Package</h2>
            <form onSubmit={handleUpdatePackage} className="space-y-4">
              {/* Package Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Package Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'individual' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'individual'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-white/10 bg-dark-900 text-gray-400 hover:border-blue-500/50'
                      }`}
                  >
                    <User className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Individual</p>
                    <p className="text-xs mt-1">For personal users</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'institute' })}
                    className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'institute'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-white/10 bg-dark-900 text-gray-400 hover:border-green-500/50'
                      }`}
                  >
                    <Building2 className="w-6 h-6 mx-auto mb-2" />
                    <p className="font-medium">Institute</p>
                    <p className="text-xs mt-1">For institutions</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Package Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Student Limit</label>
                <input
                  type="number"
                  value={formData.studentLimit}
                  onChange={(e) => setFormData({ ...formData, studentLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price per Month (₹)</label>
                <input
                  type="number"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  min="0"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 bg-dark-900 border border-white/10 text-white rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPackages;
