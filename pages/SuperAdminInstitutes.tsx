import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Package,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Clock,
  Ban,
  Loader2,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Institute {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  website: string | null;
  status: 'active' | 'inactive' | 'suspended';
  studentCount: number;
  adminCount: number;
  staffCount: number;
  subscriptions?: any[];
  createdAt: string;
}

interface PackageType {
  id: number;
  name: string;
  description: string;
  studentLimit: number;
  pricePerMonth: number;
  features: string[];
  isActive: boolean;
}

const SuperAdminInstitutes: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(action === 'create');
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);

  // Package state
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [durationMonths, setDurationMonths] = useState<number>(12);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => {
    fetchInstitutes();
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
      setPackages(data.filter((pkg: PackageType) => pkg.isActive));
    } catch (err: any) {
      console.error('Error fetching packages:', err);
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

      if (!response.ok) {
        throw new Error('Failed to fetch institutes');
      }

      const data = await response.json();
      setInstitutes(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load institutes');
      setLoading(false);
    }
  };

  const handleCreateInstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      // Create institute
      const response = await fetch(`${API_BASE_URL}/superadmin/institutes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create institute');
      }

      const data = await response.json();
      const instituteId = data.institute.id;

      // If package is selected, create subscription
      if (selectedPackageId) {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + durationMonths);

        const subscriptionResponse = await fetch(`${API_BASE_URL}/superadmin/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            instituteId: instituteId,
            packageId: selectedPackageId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            paymentStatus: 'paid',
          }),
        });

        if (!subscriptionResponse.ok) {
          console.error('Failed to create subscription, but institute was created');
          toast.error('Institute created but subscription failed');
        }
      }

      const packageInfo = selectedPackageId
        ? `\n\nPackage: ${packages.find((p) => p.id === selectedPackageId)?.name}\nDuration: ${durationMonths} months`
        : '';

      toast.success(`Institute created successfully!${packageInfo}`);

      setShowCreateModal(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
      setSelectedPackageId(null);
      setDurationMonths(12);
      fetchInstitutes();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstitute = async (institute: Institute) => {
    if (!confirm(`Are you sure you want to delete "${institute.name}"?\n\nThis will permanently delete:\n- ${institute.adminCount} admins\n- ${institute.staffCount} staff members\n- ${institute.studentCount} students\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes/${institute.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete institute');
      }

      alert('✅ Institute deleted successfully');
      fetchInstitutes();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleApproveInstitute = async (institute: Institute) => {
    if (!confirm(`Approve "${institute.name}"?\n\nThis will:\n- Activate the institute\n- Enable admin login access\n- Send approval notification email`)) {
      return;
    }

    try {
      setProcessingApproval(institute.id);
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes/${institute.id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve institute');
      }

      alert('✅ Institute approved successfully! The admin can now login.');
      fetchInstitutes();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleRejectInstitute = async (institute: Institute) => {
    const reason = prompt(`Reject "${institute.name}"?\n\nPlease provide a reason for rejection:`);
    if (!reason || reason.trim() === '') {
      return;
    }

    try {
      setProcessingApproval(institute.id);
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes/${institute.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reject institute');
      }

      alert('✅ Institute rejected. Rejection notification sent.');
      fetchInstitutes();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessingApproval(null);
    }
  };

  const filteredInstitutes = institutes.filter((inst) => {
    // Filter by search query
    const matchesSearch =
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && inst.status === 'inactive') ||
      (filterStatus === 'active' && inst.status === 'active') ||
      (filterStatus === 'suspended' && inst.status === 'suspended');

    return matchesSearch && matchesStatus;
  });

  // Count institutes by status
  const pendingCount = institutes.filter((i) => i.status === 'inactive').length;
  const activeCount = institutes.filter((i) => i.status === 'active').length;
  const suspendedCount = institutes.filter((i) => i.status === 'suspended').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'suspended':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'inactive':
        return 'Pending';
      case 'active':
        return 'Active';
      case 'suspended':
        return 'Suspended';
      default:
        return status;
    }
  };

  if (loading && institutes.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading institutes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <div className="bg-dark-800 border-b border-white/10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Institute Management</h1>
              <p className="text-gray-400">Manage educational institutes and their subscriptions</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search institutes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-neon-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Institute
            </button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
                ? 'bg-neon-blue text-white'
                : 'bg-dark-900 text-gray-400 hover:text-white'
                }`}
            >
              All ({institutes.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterStatus === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-dark-900 text-gray-400 hover:text-white'
                }`}
            >
              <Clock className="w-4 h-4" />
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterStatus === 'active'
                ? 'bg-green-500 text-white'
                : 'bg-dark-900 text-gray-400 hover:text-white'
                }`}
            >
              <CheckCircle className="w-4 h-4" />
              Active ({activeCount})
            </button>
            <button
              onClick={() => setFilterStatus('suspended')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${filterStatus === 'suspended'
                ? 'bg-red-500 text-white'
                : 'bg-dark-900 text-gray-400 hover:text-white'
                }`}
            >
              <Ban className="w-4 h-4" />
              Suspended ({suspendedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Institutes Grid */}
      <div className="container mx-auto px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.map((institute) => (
            <div
              key={institute.id}
              className="bg-dark-800 border border-white/10 rounded-lg p-6 hover:border-neon-blue transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-neon-blue/10 border border-neon-blue/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-neon-blue" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{institute.name}</h3>
                    <span className={`inline-block px-2 py-1 rounded text-xs border ${getStatusColor(institute.status)}`}>
                      {getStatusLabel(institute.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  {institute.email}
                </div>
                {institute.phone && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Phone className="w-4 h-4" />
                    {institute.phone}
                  </div>
                )}
                {institute.website && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Globe className="w-4 h-4" />
                    <a href={institute.website} target="_blank" rel="noopener noreferrer" className="hover:text-neon-blue">
                      {institute.website}
                    </a>
                  </div>
                )}
                {institute.address && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4" />
                    {institute.address.substring(0, 50)}...
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-dark-900 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{institute.studentCount}</p>
                  <p className="text-gray-500 text-xs">Students</p>
                </div>
                <div className="bg-dark-900 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{institute.adminCount}</p>
                  <p className="text-gray-500 text-xs">Admins</p>
                </div>
                <div className="bg-dark-900 rounded-lg p-3 text-center">
                  <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-white font-bold text-lg">{institute.staffCount}</p>
                  <p className="text-gray-500 text-xs">Staff</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {institute.status === 'inactive' ? (
                  // Pending institutes - show approve/reject buttons
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveInstitute(institute)}
                      disabled={processingApproval === institute.id}
                      className="flex-1 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingApproval === institute.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRejectInstitute(institute)}
                      disabled={processingApproval === institute.id}
                      className="flex-1 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {processingApproval === institute.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  // Active/Suspended institutes - show view/delete buttons
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/superadmin/institutes/${institute.id}`)}
                      className="flex-1 px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteInstitute(institute)}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredInstitutes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No institutes found</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-2 bg-neon-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create First Institute
            </button>
          </div>
        )}
      </div>

      {/* Create Institute Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-dark-800 border border-white/10 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Create New Institute</h2>
              <p className="text-gray-400 mt-1">Add a new educational institute with admin user</p>
            </div>

            <form onSubmit={handleCreateInstitute} className="p-6 space-y-6">
              {/* Institute Details */}
              <div>
                <h3 className="text-white font-semibold mb-4">Institute Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Institute Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                      placeholder="ABC Engineering College"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Institute Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                        placeholder="admin@abc.edu.in"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                      placeholder="https://abc.edu.in"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                      rows={3}
                      placeholder="123 Main Street, Mumbai, Maharashtra"
                    />
                  </div>
                </div>
              </div>

              {/* Package Selection (Optional) */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-4">Package Assignment (Optional)</h3>
                <p className="text-gray-400 text-sm mb-4">Assign a subscription package to the institute. You can also do this later.</p>
                <div className="space-y-4">
                  {/* Package Selection */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-3">Select Package</label>
                    <div className="grid grid-cols-1 gap-3">
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(selectedPackageId === pkg.id ? null : pkg.id)}
                          className={`p-4 rounded-lg border-2 transition-all text-left ${selectedPackageId === pkg.id
                            ? 'border-neon-purple bg-neon-purple/10'
                            : 'border-gray-700 bg-dark-900 hover:border-gray-600'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-bold mb-1">{pkg.name}</h4>
                              <p className="text-gray-400 text-sm mb-2">{pkg.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-neon-blue" />
                                  <span className="text-gray-300">{pkg.studentLimit} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-400" />
                                  <span className="text-gray-300">₹{pkg.pricePerMonth.toLocaleString()}/month</span>
                                </div>
                              </div>
                            </div>
                            {selectedPackageId === pkg.id && (
                              <CheckCircle className="w-6 h-6 text-neon-purple flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                      {packages.length === 0 && (
                        <p className="text-gray-500 text-sm">No packages available. Create packages first.</p>
                      )}
                    </div>
                  </div>

                  {/* Duration Selection */}
                  {selectedPackageId && (
                    <div>
                      <label className="block text-gray-400 text-sm mb-3">Subscription Duration</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[6, 12, 24].map((months) => (
                          <button
                            key={months}
                            type="button"
                            onClick={() => setDurationMonths(months)}
                            className={`p-3 rounded-lg border-2 transition-all ${durationMonths === months
                              ? 'border-neon-blue bg-neon-blue/10 text-white'
                              : 'border-gray-700 bg-dark-900 text-gray-400 hover:border-gray-600'
                              }`}
                          >
                            <div className="font-bold">{months} Months</div>
                            <div className="text-xs mt-1">
                              {months === 12 ? '(Recommended)' : ''}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedPackageId && (
                    <div className="p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Subscription Summary</p>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">
                          {packages.find((p) => p.id === selectedPackageId)?.name}
                        </span>
                        <span className="text-neon-purple font-bold">
                          ₹
                          {(
                            (packages.find((p) => p.id === selectedPackageId)?.pricePerMonth || 0) *
                            durationMonths
                          ).toLocaleString()}{' '}
                          total
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        Valid for {durationMonths} months from creation date
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin User Details */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-4">Admin User Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Admin Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Admin Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                        placeholder="john@abc.edu.in"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Admin Password *</label>
                      <input
                        type="password"
                        required
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 px-4 text-white focus:border-neon-blue outline-none"
                        placeholder="Min 8 characters"
                        minLength={8}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      website: '',
                      adminName: '',
                      adminEmail: '',
                      adminPassword: '',
                    });
                  }}
                  className="px-6 py-3 bg-dark-900 border border-white/10 text-white rounded-lg hover:bg-dark-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-neon-blue hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Institute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminInstitutes;
