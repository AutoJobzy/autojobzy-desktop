import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  Package,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Plus,
  X,
  Loader2,
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
  createdAt: string;
}

interface Subscription {
  id: string;
  packageId: number;
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  startDate: string;
  endDate: string;
  package: {
    name: string;
    studentLimit: number;
    pricePerMonth: number;
  };
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

const SuperAdminInstituteDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'staff' | 'admins'>('overview');

  // Package assignment modal state
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [packageLoading, setPackageLoading] = useState(false);
  const [durationMonths, setDurationMonths] = useState<number>(12);

  useEffect(() => {
    if (id) {
      fetchInstituteDetails();
    }
  }, [id]);

  const fetchInstituteDetails = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/superadmin/institutes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch institute details');
      }

      const data = await response.json();
      const instituteData = data.find((inst: Institute) => inst.id === id);

      if (!instituteData) {
        throw new Error('Institute not found');
      }

      setInstitute(instituteData);

      // Fetch subscription if available
      if (instituteData.subscriptions && instituteData.subscriptions.length > 0) {
        setSubscription(instituteData.subscriptions[0]);
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load institute details');
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
      toast.error(err.message || 'Failed to load packages');
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedPackageId || !id) {
      toast.error('Please select a package');
      return;
    }

    try {
      setPackageLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const response = await fetch(`${API_BASE_URL}/superadmin/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instituteId: id,
          packageId: selectedPackageId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          paymentStatus: 'paid', // Super admin assigns as paid
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign package');
      }

      toast.success('Package assigned successfully!');
      setShowPackageModal(false);
      setSelectedPackageId(null);
      fetchInstituteDetails(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign package');
    } finally {
      setPackageLoading(false);
    }
  };

  const openPackageModal = () => {
    fetchPackages();
    setShowPackageModal(true);
    if (subscription) {
      setSelectedPackageId(subscription.packageId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'suspended':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'expired':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading institute details...</p>
        </div>
      </div>
    );
  }

  if (error || !institute) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-xl mb-4">{error || 'Institute not found'}</p>
          <button
            onClick={() => navigate('/superadmin/institutes')}
            className="px-6 py-3 bg-neon-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Institutes
          </button>
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
              onClick={() => navigate('/superadmin/institutes')}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-neon-blue/10 border border-neon-blue/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-neon-blue" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{institute.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getStatusColor(institute.status)}`}>
                    {institute.status}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Created {formatDate(institute.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Institute Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Email</p>
                    <p className="text-white">{institute.email}</p>
                  </div>
                </div>

                {institute.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-xs">Phone</p>
                      <p className="text-white">{institute.phone}</p>
                    </div>
                  </div>
                )}

                {institute.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-xs">Website</p>
                      <a
                        href={institute.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neon-blue hover:underline"
                      >
                        {institute.website}
                      </a>
                    </div>
                  </div>
                )}

                {institute.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-xs">Address</p>
                      <p className="text-white">{institute.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Statistics</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-400">Students</span>
                  </div>
                  <span className="text-white font-bold text-xl">{institute.studentCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-400">Admins</span>
                  </div>
                  <span className="text-white font-bold text-xl">{institute.adminCount}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-dark-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-400" />
                    <span className="text-gray-400">Staff</span>
                  </div>
                  <span className="text-white font-bold text-xl">{institute.staffCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Subscription & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subscription Card */}
            {subscription ? (
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-semibold text-lg">Current Subscription</h2>
                  <button
                    onClick={openPackageModal}
                    className="px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 text-neon-blue rounded-lg hover:bg-neon-blue/20 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Change Package
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Package className="w-6 h-6 text-purple-400" />
                      <div>
                        <p className="text-gray-500 text-xs">Package</p>
                        <p className="text-white font-semibold text-lg">{subscription.package.name}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Student Limit</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-dark-900 rounded-full h-2">
                            <div
                              className="bg-neon-blue h-2 rounded-full"
                              style={{
                                width: `${Math.min((institute.studentCount / subscription.package.studentLimit) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium">
                            {institute.studentCount} / {subscription.package.studentLimit}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-gray-500 text-xs">Price</p>
                        <p className="text-white font-bold text-xl">
                          ₹{subscription.package.pricePerMonth.toLocaleString('en-IN')}
                          <span className="text-gray-400 text-sm font-normal">/month</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getStatusColor(subscription.status)}`}>
                          {subscription.status}
                        </span>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm border ${getStatusColor(subscription.paymentStatus)}`}>
                          {subscription.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">Start Date</p>
                      <p className="text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(subscription.startDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs">End Date</p>
                      <p className="text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-4">No active subscription</p>
                  <button
                    onClick={openPackageModal}
                    className="px-6 py-3 bg-neon-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 inline mr-2" />
                    Assign Package
                  </button>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
              <h2 className="text-white font-semibold text-lg mb-4">Additional Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-900 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Remaining Slots</p>
                  <p className="text-white font-bold text-2xl">
                    {subscription ? subscription.package.studentLimit - institute.studentCount : 0}
                  </p>
                </div>

                <div className="p-4 bg-dark-900 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Capacity Used</p>
                  <p className="text-white font-bold text-2xl">
                    {subscription
                      ? Math.round((institute.studentCount / subscription.package.studentLimit) * 100)
                      : 0}
                    %
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-semibold text-sm">Institute Management</p>
                    <p className="text-gray-400 text-sm mt-1">
                      This institute can be managed by institute admins. Students and staff are managed within the
                      institute's admin panel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Assignment Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-neon-purple" />
                {subscription ? 'Change Package' : 'Assign Package'}
              </h2>
              <button
                onClick={() => setShowPackageModal(false)}
                className="p-2 hover:bg-dark-900 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Package Selection */}
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                  Select Package
                </label>
                <div className="grid grid-cols-1 gap-4">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${selectedPackageId === pkg.id
                        ? 'border-neon-purple bg-neon-purple/10'
                        : 'border-gray-700 bg-dark-900 hover:border-gray-600'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{pkg.name}</h3>
                          <p className="text-gray-400 text-sm mb-3">{pkg.description}</p>
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
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                  Subscription Duration
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[6, 12, 24].map((months) => (
                    <button
                      key={months}
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
                    Valid for {durationMonths} months from assignment date
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="flex-1 bg-dark-900 text-gray-400 font-bold py-3 rounded-lg hover:bg-dark-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignPackage}
                  disabled={!selectedPackageId || packageLoading}
                  className="flex-1 bg-neon-purple text-white font-bold py-3 rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {packageLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {subscription ? 'Change Package' : 'Assign Package'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminInstituteDetails;
