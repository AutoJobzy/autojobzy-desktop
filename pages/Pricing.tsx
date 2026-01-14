import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Zap, Crown, Rocket, AlertCircle, CheckCircle, Loader2, ArrowRight, UserPlus } from 'lucide-react';
import { getPlans, createOrder, initiatePayment, getSubscriptionStatus } from '../services/subscriptionApi';
import { useApp } from '../context/AppContext';

interface PlanFeature {
  id: string;
  featureKey: string;
  featureValue: string;
  featureLabel?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: PlanFeature[];
  sortOrder: number;
}

interface Subscription {
  id: string;
  planName: string;
  endDate: string;
  daysRemaining: number;
  status: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);

  // Check if coming from signup flow
  const locationState = location.state as { fromSignup?: boolean; signupData?: SignupData } | null;
  const isSignupFlow = locationState?.fromSignup && locationState?.signupData;
  const signupData = locationState?.signupData;

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem('token');
  const userInfo = isSignupFlow ? signupData : JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadPlans();
    if (isLoggedIn) {
      loadSubscriptionStatus();
    }
  }, [isLoggedIn]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result = await getPlans();
      if (result.success) {
        setPlans(result.data || []);
      } else {
        setError(result.error || 'Failed to load plans');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const result = await getSubscriptionStatus();
      if (result.success && result.data.hasActiveSubscription) {
        setCurrentSubscription(result.data.subscription);
      }
    } catch (err) {
      console.error('Failed to load subscription status:', err);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    // SIGNUP FLOW: User is signing up - no account yet
    if (isSignupFlow && signupData) {
      console.log('[Pricing] Signup flow detected - creating order for new user');
      setProcessingPlanId(plan.id);
      setError(null);
      setSuccess(null);

      try {
        // Create guest order (no authentication required)
        console.log('[Pricing] Creating guest order for plan:', plan.id);
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/subscription/create-guest-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ planId: plan.id }),
        });

        const orderResult = await response.json();
        console.log('[Pricing] Guest order result:', orderResult);

        if (!orderResult.success) {
          throw new Error(orderResult.error || 'Failed to create order');
        }

        if (!orderResult.data || !orderResult.data.orderId) {
          throw new Error('Invalid order data received from server');
        }

        console.log('[Pricing] Guest order created:', orderResult.data.orderId);
        console.log('[Pricing] Initiating payment for signup...');

        // Load Razorpay SDK
        const { loadRazorpayScript } = await import('../services/subscriptionApi');
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error('Failed to load Razorpay SDK. Please check your internet connection.');
        }

        console.log('[Pricing] Razorpay SDK loaded, opening payment modal...');

        // Handle payment directly for signup flow (NO verification call)
        const options = {
          key: orderResult.data.keyId,
          amount: orderResult.data.amount,
          currency: orderResult.data.currency,
          name: 'AutoJobzy',
          description: orderResult.data.planName || 'Subscription Plan',
          order_id: orderResult.data.orderId,
          handler: async function (razorpayResponse: any) {
            console.log('[Pricing] Payment completed!', razorpayResponse);
            console.log('[Pricing] Creating account with payment details...');

            try {
              // Complete signup with payment details
              const signupResponse = await fetch(`${API_BASE_URL}/auth/signup-with-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...signupData,
                  planId: plan.id,
                  razorpay_order_id: razorpayResponse.razorpay_order_id,
                  razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                  razorpay_signature: razorpayResponse.razorpay_signature,
                }),
              });

              const signupDataResponse = await signupResponse.json();
              console.log('[Pricing] Signup response:', signupDataResponse);

              if (!signupResponse.ok || !signupDataResponse.success) {
                throw new Error(signupDataResponse.error || 'Failed to create account');
              }

              console.log('[Pricing] Account created successfully!');
              console.log('[Pricing] Storing token and logging in...');

              // Store token and auto-login
              localStorage.setItem('token', signupDataResponse.token);
              localStorage.setItem('user', JSON.stringify(signupDataResponse.user));

              login(
                signupDataResponse.user.firstName || 'User',
                signupDataResponse.user.email,
                signupDataResponse.user.onboardingCompleted
              );

              console.log('[Pricing] Login successful, showing success message');

              setSuccess(`Welcome ${signupDataResponse.user.firstName}! Your account is ready.`);
              setProcessingPlanId(null);

              // Redirect to dashboard
              console.log('[Pricing] Redirecting to dashboard in 2 seconds...');
              setTimeout(() => {
                console.log('[Pricing] Navigating to dashboard now');
                navigate('/dashboard');
              }, 2000);
            } catch (signupError: any) {
              console.error('[Pricing] Signup error:', signupError);
              setError(signupError.message || 'Payment successful but account creation failed. Please contact support.');
              setProcessingPlanId(null);
            }
          },
          prefill: {
            name: `${signupData.firstName} ${signupData.lastName}`,
            email: signupData.email,
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: function () {
              console.log('[Pricing] Payment modal dismissed by user');
              setError('Payment cancelled. Please try again.');
              setProcessingPlanId(null);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);

        razorpay.on('payment.failed', function (response: any) {
          console.error('[Pricing] Payment failed:', response.error);
          setError(response.error.description || 'Payment failed. Please try again.');
          setProcessingPlanId(null);
        });

        razorpay.open();
      } catch (err: any) {
        console.error('[Pricing] Error in signup payment flow:', err);
        setError(err.message || 'An error occurred. Please try again.');
        setProcessingPlanId(null);
      }
      return;
    }

    // NORMAL FLOW: User already logged in
    if (!isLoggedIn) {
      console.log('[Pricing] User not logged in, redirecting to login');
      navigate('/login', { state: { from: '/pricing', planId: plan.id } });
      return;
    }

    console.log('[Pricing] Starting payment flow for plan:', plan.name);
    setProcessingPlanId(plan.id);
    setError(null);
    setSuccess(null);

    try {
      // Create order
      console.log('[Pricing] Creating order for plan ID:', plan.id);
      const orderResult = await createOrder(plan.id);
      console.log('[Pricing] Order creation result:', orderResult);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      if (!orderResult.data || !orderResult.data.orderId) {
        throw new Error('Invalid order data received from server');
      }

      console.log('[Pricing] Order created successfully:', orderResult.data.orderId);
      console.log('[Pricing] Initiating Razorpay payment...');

      // Initiate payment
      initiatePayment(
        orderResult.data,
        userInfo,
        (successResult) => {
          console.log('[Pricing] Payment successful:', successResult);
          setSuccess('Payment successful! Your subscription is now active.');
          setProcessingPlanId(null);
          loadSubscriptionStatus();
          // Redirect to dashboard after 2 seconds
          setTimeout(() => navigate('/dashboard'), 2000);
        },
        (failureResult) => {
          console.error('[Pricing] Payment failed:', failureResult);
          setError(failureResult.error || 'Payment failed. Please try again.');
          setProcessingPlanId(null);
        }
      );
    } catch (err: any) {
      console.error('[Pricing] Error in payment flow:', err);
      setError(err.message || 'An error occurred. Please try again.');
      setProcessingPlanId(null);
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [Zap, Crown, Rocket];
    const Icon = icons[index % icons.length];
    return <Icon className="w-8 h-8" />;
  };

  const getPlanGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
    ];
    return gradients[index % gradients.length];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing Plans - AutoJobzy | Job Automation from ₹299</title>
        <meta name="description" content="Choose the perfect plan for your job search automation. Plans start from ₹299. Unlimited applications on Naukri & LinkedIn. Get 50% OFF on premium plans!" />
        <link rel="canonical" href="https://job-automate.onrender.com/pricing" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Header */}
        <div className="pt-20 pb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {isSignupFlow ? 'Complete Your Signup' : 'Choose Your Plan'}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto px-4">
            {isSignupFlow
              ? 'Select a plan to activate your account and start automating'
              : 'Automate your job applications and land your dream job faster'}
          </p>
        </div>

        {/* Signup Flow Banner */}
        {isSignupFlow && signupData && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-white font-medium">
                    Creating account for {signupData.firstName} {signupData.lastName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Select a plan below and complete payment to activate your account
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Subscription Banner */}
        {currentSubscription && !isSignupFlow && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-indigo-400" />
                <div>
                  <p className="text-white font-medium">
                    Active Plan: {currentSubscription.planName}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {currentSubscription.daysRemaining} days remaining
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="max-w-6xl mx-auto px-4 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const isPopular = index === 1;
              const isProcessing = processingPlanId === plan.id;
              const isCurrentPlan = currentSubscription?.planName === plan.name;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-gray-800/50 backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 ${isPopular
                    ? 'border-indigo-500 scale-105 shadow-2xl shadow-indigo-500/20'
                    : 'border-gray-700 hover:border-gray-600'
                    }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Plan Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPlanGradient(
                      index
                    )} flex items-center justify-center text-white mb-6`}
                  >
                    {getPlanIcon(index)}
                  </div>

                  {/* Plan Name & Description */}
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-400 ml-2">
                      / {plan.durationDays} days
                    </span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature.id} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">
                          {feature.featureLabel || feature.featureValue}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isProcessing || isCurrentPlan}
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${isCurrentPlan
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isPopular
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {plans.length === 0 && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No plans available at the moment.</p>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-4xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-sm">
            <a href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
              Terms & Conditions
            </a>
            <a href="/refund-policy" className="text-gray-400 hover:text-white transition-colors">
              Refund Policy
            </a>
            <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pricing;
