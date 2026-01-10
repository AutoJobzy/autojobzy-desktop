import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Bug,
  Palette,
  MessageSquare,
  Send,
  CheckCircle,
  Clock,
  Gift,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  Loader2
} from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'feature_request' | 'bug_report' | 'ux_improvement' | 'general_feedback';
  title: string;
  description: string;
  status: 'pending' | 'under_review' | 'approved' | 'implemented' | 'rewarded' | 'rejected';
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat_amount';
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  expiryDate: string;
  isUsed: boolean;
  usedAt?: string;
  isActive: boolean;
}

interface Stats {
  total: number;
  statusBreakdown: {
    pending: number;
    underReview: number;
    approved: number;
    implemented: number;
    rewarded: number;
    rejected: number;
  };
  coupons: {
    available: number;
    list: Coupon[];
  };
}

const SuggestAndEarn: React.FC = () => {
  const [activeView, setActiveView] = useState<'submit' | 'history'>('submit');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'feature_request' as const,
    title: '',
    description: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

  const suggestionTypes = [
    {
      id: 'feature_request',
      label: 'Feature Request',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      description: 'Suggest new features or improvements'
    },
    {
      id: 'bug_report',
      label: 'Bug Report',
      icon: Bug,
      color: 'from-red-500 to-pink-500',
      description: 'Report issues or bugs you found'
    },
    {
      id: 'ux_improvement',
      label: 'UX Improvement',
      icon: Palette,
      color: 'from-purple-500 to-indigo-500',
      description: 'Suggest UI/UX enhancements'
    },
    {
      id: 'general_feedback',
      label: 'General Feedback',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
      description: 'Share your thoughts and feedback'
    }
  ];

  const statusConfig = {
    pending: { label: 'Pending Review', icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' },
    under_review: { label: 'Under Review', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    implemented: { label: 'Implemented', icon: Award, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    rewarded: { label: 'Rewarded', icon: Gift, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    rejected: { label: 'Rejected', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' }
  };

  useEffect(() => {
    loadStats();
    loadSuggestions();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/suggestions/stats/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data.suggestions);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Suggestion submitted successfully! We will review it soon.');
        setFormData({ type: 'feature_request', title: '', description: '' });
        loadStats();
        loadSuggestions();

        // Switch to history view after successful submission
        setTimeout(() => {
          setActiveView('history');
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.error || 'Failed to submit suggestion');
      }
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCouponLabel = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">Suggest & Earn Rewards</h1>
            <p className="text-gray-300">
              Share your ideas, report bugs, or suggest improvements. Get rewarded with discount coupons
              when your suggestions are implemented!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Suggestions</div>
            <div className="text-3xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Under Review</div>
            <div className="text-3xl font-bold text-blue-400">{stats.statusBreakdown.underReview}</div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Implemented</div>
            <div className="text-3xl font-bold text-green-400">{stats.statusBreakdown.implemented}</div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Available Coupons</div>
            <div className="text-3xl font-bold text-yellow-400">{stats.coupons.available}</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveView('submit')}
          className={`px-6 py-3 font-medium transition-all relative ${activeView === 'submit' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
          Submit Suggestion
          {activeView === 'submit' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          )}
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`px-6 py-3 font-medium transition-all relative ${activeView === 'history' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
        >
          My Suggestions & Rewards
          {activeView === 'history' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
          )}
        </button>
      </div>

      {/* Submit View */}
      {activeView === 'submit' && (
        <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-white font-medium mb-3">Suggestion Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestionTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id as any })}
                      className={`p-4 rounded-lg border transition-all text-left ${isSelected
                        ? 'border-yellow-500/50 bg-yellow-500/10'
                        : 'border-white/10 bg-dark-900 hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${type.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium mb-1">{type.label}</div>
                          <div className="text-gray-400 text-sm">{type.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-white font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Brief summary of your suggestion"
                required
                minLength={5}
                maxLength={255}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50"
              />
              <div className="text-gray-500 text-sm mt-1">
                {formData.title.length}/255 characters
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed information about your suggestion..."
                required
                minLength={20}
                rows={6}
                className="w-full px-4 py-3 bg-dark-900 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 resize-none"
              />
              <div className="text-gray-500 text-sm mt-1">
                {formData.description.length < 20 && `Minimum 20 characters required (${20 - formData.description.length} more)`}
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-400">{error}</div>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-400">{success}</div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium px-6 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Suggestion
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* History View */}
      {activeView === 'history' && (
        <div className="space-y-6">
          {/* Available Coupons */}
          {stats && stats.coupons.available > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-400" />
                Your Reward Coupons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.coupons.list.map((coupon) => (
                  <div key={coupon.id} className="bg-dark-800 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl font-bold text-yellow-400">
                        {getCouponLabel(coupon)}
                      </div>
                      <div className="text-gray-400 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires {formatDate(coupon.expiryDate)}
                      </div>
                    </div>
                    <div className="bg-dark-900 border border-white/10 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <code className="text-white font-mono text-lg">{coupon.code}</code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 transition-all flex items-center gap-2"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {coupon.minPurchaseAmount > 0 && (
                      <div className="text-gray-400 text-sm">
                        Min. purchase: ₹{coupon.minPurchaseAmount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          <div className="bg-dark-800 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">My Suggestions</h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-3" />
                <div className="text-gray-400">Loading suggestions...</div>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                <div className="text-gray-400">No suggestions yet. Submit your first one!</div>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestions.map((suggestion) => {
                  const status = statusConfig[suggestion.status];
                  const StatusIcon = status.icon;
                  const typeInfo = suggestionTypes.find(t => t.id === suggestion.type);
                  const TypeIcon = typeInfo?.icon || Lightbulb;

                  return (
                    <div key={suggestion.id} className="border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 bg-gradient-to-br ${typeInfo?.color || 'from-gray-500 to-gray-600'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <TypeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-white font-medium">{suggestion.title}</h3>
                            <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${status.bg} ${status.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              {status.label}
                            </div>
                          </div>
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">{suggestion.description}</p>
                          <div className="flex items-center gap-4 text-gray-500 text-sm">
                            <span>{typeInfo?.label}</span>
                            <span>•</span>
                            <span>{formatDate(suggestion.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestAndEarn;
