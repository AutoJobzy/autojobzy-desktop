import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, AlertCircle, Zap, Crown, Rocket, CheckCircle, CreditCard } from 'lucide-react';
import { getPlans, Plan } from '../services/plansApi';
import { createOrder, initiatePayment } from '../services/subscriptionApi';

const Plans: React.FC = () => {
  const { selectPlan } = useApp();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Get user info from localStorage
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getPlans();

      if (result.success && result.data) {
        setPlans(result.data);
      } else {
        setError(result.error || 'Failed to load plans');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (plan: Plan) => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      // Store selected plan and redirect to login
      localStorage.setItem('pendingPlanId', plan.id);
      navigate('/login', { state: { from: '/plans', planId: plan.id } });
      return;
    }

    setProcessing(plan.id);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Create Razorpay order
      const orderResult = await createOrder(plan.id);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Step 2: Open Razorpay payment modal
      initiatePayment(
        orderResult.data,
        {
          name: `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
          email: userInfo.email || '',
          phone: userInfo.phone || '',
        },
        // Success callback
        (result) => {
          setSuccess('Payment successful! Your subscription is now active.');
          setProcessing(null);

          // Store selected plan in localStorage
          localStorage.setItem('selectedPlanId', plan.id);
          localStorage.setItem('selectedPlan', JSON.stringify(plan));

          // Update context with plan ID
          selectPlan(plan.id);

          // Navigate to setup/dashboard after 2 seconds
          setTimeout(() => {
            navigate('/setup');
          }, 2000);
        },
        // Failure callback
        (failResult) => {
          setError(failResult.error || 'Payment failed. Please try again.');
          setProcessing(null);
        }
      );
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      setProcessing(null);
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Crown, Rocket];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  const getPlanColor = (index: number, isPopular: boolean) => {
    if (isPopular) return 'text-neon-blue';
    const colors = ['text-blue-400', 'text-purple-400', 'text-orange-400'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-neon-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error && plans.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Plans</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadPlans}
            className="px-6 py-3 bg-neon-blue text-black font-bold rounded-lg hover:bg-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-dark-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Select Your Plan
          </h2>
          <p className="text-gray-400">
            Choose a package to start automating your job applications.
          </p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-green-400 font-medium">{success}</p>
                <p className="text-green-400/70 text-sm">Redirecting to profile setup...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && plans.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No plans available at the moment.</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-8 ${
            plans.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
            plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
            'md:grid-cols-3'
          }`}>
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-dark-800 rounded-2xl border p-8 transition-transform duration-300 ${
                  plan.isPopular
                    ? 'border-neon-blue shadow-[0_0_30px_rgba(0,243,255,0.15)] scale-105 z-10'
                    : 'border-white/10 hover:border-gray-500'
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neon-blue text-black font-bold px-4 py-1 rounded-full text-sm">
                    Recommended
                  </div>
                )}

                {/* Plan Icon */}
                <div className={`mb-4 ${getPlanColor(index, plan.isPopular)}`}>
                  {getPlanIcon(index)}
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                {plan.description && (
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                )}

                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-white">{plan.priceFormatted}</span>
                  <span className="text-gray-400 ml-2">/ {plan.duration}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start">
                      <Check className="w-5 h-5 text-neon-green mr-3 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={!!processing || !!success}
                  className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.isPopular
                      ? 'bg-neon-blue text-black hover:bg-white disabled:opacity-50'
                      : 'bg-white/10 text-white hover:bg-white/20 disabled:opacity-50'
                  }`}
                >
                  {processing === plan.id ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" /> Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" /> Pay & Subscribe
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Secure Payment Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-full border border-white/10">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-gray-400 text-sm">Secure payment powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;
