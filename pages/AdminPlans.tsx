import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Crown, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PlanFeature {
  id: string;
  featureValue: string;
  featureLabel: string;
  featureKey: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  subtitle?: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  isPopular: boolean;
  comingSoon: boolean;
  sortOrder: number;
  features: PlanFeature[];
}

interface PlanFormData {
  name: string;
  description: string;
  subtitle: string;
  price: number;
  durationDays: number;
  isActive: boolean;
  isPopular: boolean;
  comingSoon: boolean;
  sortOrder: number;
  features: string[]; // Array of feature text strings
}

const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    description: '',
    subtitle: '',
    price: 0,
    durationDays: 30,
    isActive: true,
    isPopular: false,
    comingSoon: false,
    sortOrder: 0,
    features: [],
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subtitle: '',
      price: 0,
      durationDays: 30,
      isActive: true,
      isPopular: false,
      comingSoon: false,
      sortOrder: 0,
      features: [],
    });
    setNewFeature('');
    setEditingPlan(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      subtitle: plan.subtitle || '',
      price: plan.price,
      durationDays: plan.durationDays,
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      comingSoon: plan.comingSoon,
      sortOrder: plan.sortOrder,
      features: plan.features.map(f => f.featureValue || f.featureLabel),
    });
    setShowEditModal(true);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    });
  };

  const handleMoveFeatureUp = (index: number) => {
    if (index === 0) return;
    const newFeatures = [...formData.features];
    [newFeatures[index], newFeatures[index - 1]] = [newFeatures[index - 1], newFeatures[index]];
    setFormData({ ...formData, features: newFeatures });
  };

  const handleMoveFeatureDown = (index: number) => {
    if (index === formData.features.length - 1) return;
    const newFeatures = [...formData.features];
    [newFeatures[index], newFeatures[index + 1]] = [newFeatures[index + 1], newFeatures[index]];
    setFormData({ ...formData, features: newFeatures });
  };

  const createPlan = async () => {
    // Validation
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields (Name, Description)');
      return;
    }

    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    if (formData.durationDays <= 0) {
      toast.error('Duration must be greater than 0');
      return;
    }

    const loadingToast = toast.loading('Creating plan...');

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/plans`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Plan created successfully!', { id: loadingToast });
        setShowCreateModal(false);
        resetForm();
        fetchPlans();
      } else {
        toast.error(data.error || 'Failed to create plan', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Failed to create plan:', error);
      toast.error(error.message || 'Network error', { id: loadingToast });
    }
  };

  const updatePlan = async () => {
    if (!editingPlan) return;

    // Validation
    if (!formData.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (formData.price < 0) {
      toast.error('Price cannot be negative');
      return;
    }
    if (formData.durationDays <= 0) {
      toast.error('Duration must be greater than 0 days');
      return;
    }
    if (formData.features.some(f => !f.trim())) {
      toast.error('Features cannot be empty');
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading('Updating plan...');

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Plan updated successfully!', { id: loadingToast });
        setShowEditModal(false);
        resetForm();
        await fetchPlans();
      } else {
        toast.error(data.error || 'Failed to update plan', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Update plan error:', error);
      toast.error(error.message || 'Network error', { id: loadingToast });
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Failed to update plan:', error);
    }
  };

  const deletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone.`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting plan...');

    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      const response = await fetch(`${API_BASE_URL}/admin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Plan deleted successfully', { id: loadingToast });
        await fetchPlans();
      } else {
        toast.error(data.error || 'Failed to delete plan', { id: loadingToast });
      }
    } catch (error: any) {
      console.error('Delete plan error:', error);
      toast.error(error.message || 'Network error', { id: loadingToast });
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Plan Management</h1>
          <p className="text-gray-400">Manage subscription plans and pricing</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg text-white font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading plans...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-dark-800 border rounded-xl p-6 transition-all ${plan.isPopular
                ? 'border-red-500 shadow-lg shadow-red-500/20'
                : plan.comingSoon
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20 opacity-75'
                  : 'border-white/10 hover:border-white/20'
                }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {plan.isPopular && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    <Crown className="w-3 h-3" />
                    POPULAR
                  </span>
                )}
                {plan.comingSoon && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500 text-white text-xs font-bold rounded-full">
                    <Clock className="w-3 h-3" />
                    COMING SOON
                  </span>
                )}
                {!plan.isActive && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                    <X className="w-3 h-3" />
                    INACTIVE
                  </span>
                )}
              </div>

              {/* Plan Info */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              {plan.subtitle && (
                <p className="text-sm text-gray-400 mb-4">{plan.subtitle}</p>
              )}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-white">₹{plan.price}</span>
                <span className="text-gray-400">/ {plan.durationDays} days</span>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-2 max-h-64 overflow-y-auto">
                {plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature.featureLabel}</span>
                  </div>
                ))}
                {plan.features.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No features added</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.isActive)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all ${plan.isActive
                    ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                    }`}
                >
                  {plan.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => deletePlan(plan.id, plan.name)}
                  className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && plans.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Plans Yet</h3>
          <p className="text-gray-400 mb-4">Create your first subscription plan to get started</p>
          <button
            onClick={openCreateModal}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg text-white font-medium transition-all"
          >
            Create Plan
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Plan</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Professional Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Brief description of the plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Most Popular"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.comingSoon}
                    onChange={(e) => setFormData({ ...formData, comingSoon: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Coming Soon</span>
                </label>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    className="flex-1 px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Add a feature..."
                  />
                  <button
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-dark-900 p-2 rounded-lg">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveFeatureUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveFeatureDown(index)}
                          disabled={index === formData.features.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <span className="flex-1 text-gray-300 text-sm">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-500/10 text-gray-400 rounded-lg hover:bg-gray-500/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createPlan}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-lg text-white font-medium transition-all"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-6 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Plan: {editingPlan.name}</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plan Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Professional Plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Brief description of the plan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Most Popular"
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Status Toggles */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.comingSoon}
                    onChange={(e) => setFormData({ ...formData, comingSoon: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">Coming Soon</span>
                </label>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Features
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                    className="flex-1 px-4 py-2 bg-dark-900 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Add a feature..."
                  />
                  <button
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-dark-900 p-2 rounded-lg">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleMoveFeatureUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveFeatureDown(index)}
                          disabled={index === formData.features.length - 1}
                          className="p-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          ▼
                        </button>
                      </div>
                      <span className="flex-1 text-gray-300 text-sm">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-all"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  if (!isUpdating) {
                    setShowEditModal(false);
                    resetForm();
                  }
                }}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isUpdating
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
              >
                Cancel
              </button>
              <button
                onClick={updatePlan}
                disabled={isUpdating}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${isUpdating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600'
                  }`}
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPlans;
