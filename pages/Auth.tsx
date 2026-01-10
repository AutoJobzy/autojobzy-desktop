import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader2, AlertCircle, CheckCircle, Sparkles, Building2 } from 'lucide-react';

interface AuthProps {
  type: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ type }) => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [userType, setUserType] = useState<'individual' | 'institute'>('individual');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      if (type === 'signup') {
        // NEW FLOW: Don't create account yet, go to plan selection first
        // Trim all fields
        const trimmedFirstName = formData.firstName?.trim() || '';
        const trimmedLastName = formData.lastName?.trim() || '';
        const trimmedEmail = formData.email?.trim() || '';
        const trimmedPassword = formData.password?.trim() || '';

        // Validate signup data
        if (!trimmedFirstName || !trimmedLastName || !trimmedEmail || !trimmedPassword) {
          throw new Error('Please fill in all fields');
        }

        if (!acceptedTerms) {
          throw new Error('Please accept the Terms & Conditions');
        }

        // Check if email format is valid
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          throw new Error('Please enter a valid email address');
        }

        // Check password strength
        if (trimmedPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        console.log('[Signup] Form validated, proceeding to plan selection');
        console.log('[Signup] User type:', userType);
        setLoading(false);

        // Navigate based on user type
        if (userType === 'individual') {
          // Individual users go to pricing page (existing plans table)
          navigate('/pricing', {
            replace: true,
            state: {
              fromSignup: true,
              userType: 'individual',
              signupData: {
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                email: trimmedEmail,
                password: trimmedPassword,
              }
            }
          });
        } else {
          // Institute users - go to institute signup page
          navigate('/institute-signup', {
            replace: true,
            state: {
              prefillData: {
                adminFirstName: trimmedFirstName,
                adminLastName: trimmedLastName,
                adminEmail: trimmedEmail,
                adminPassword: trimmedPassword,
              }
            }
          });
        }
      } else {
        // LOGIN FLOW: Trim and validate before API call
        const trimmedEmail = formData.email?.trim() || '';
        const trimmedPassword = formData.password?.trim() || '';

        if (!trimmedEmail) {
          throw new Error('Email is required');
        }

        if (!trimmedPassword) {
          throw new Error('Password is required');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
          throw new Error('Please enter a valid email address');
        }

        setLoading(true);

        // Call Login API with trimmed values
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: trimmedEmail,
            password: trimmedPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Update context with onboarding status
        login(data.user.firstName || 'User', formData.email, data.user.onboardingCompleted);
        setLoading(false);

        // Show welcome popup
        setWelcomeName(data.user.firstName || 'User');
        setShowWelcome(true);

        // Navigate to dashboard after showing welcome
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-gradient-to-br from-primary-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-100/50 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[120px]"></div>

      {/* Welcome Popup Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-primary-200 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-fadeIn">
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-neon-green/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-neon-green to-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Welcome Text */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                {type === 'signup' ? 'Welcome!' : 'Welcome Back!'}
              </h2>
              <Sparkles className="w-5 h-5 text-primary-500" />
            </div>

            <p className="text-xl text-primary-600 font-semibold mb-4">
              Hello, {welcomeName}!
            </p>

            <p className="text-gray-600 mb-6">
              {type === 'signup'
                ? "Your account has been created successfully! Please select a subscription plan to continue..."
                : "You've successfully logged in. Redirecting you to your dashboard..."}
            </p>

            {/* Loading Bar */}
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full animate-loadingBar"></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
            {type === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 text-sm">
            {type === 'login'
              ? 'Enter your credentials to access your dashboard'
              : 'Start your automation journey today'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Type Selection for both Login and Signup */}
          {(type === 'login' || type === 'signup') && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {type === 'login' ? 'I am logging in as' : 'I am signing up as'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType('individual')}
                  className={`p-4 rounded-lg border-2 transition-all ${userType === 'individual'
                    ? 'border-primary-500 bg-primary-50 text-gray-900'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <UserIcon className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Individual</p>
                  <p className="text-xs mt-1 opacity-70">Personal use</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (type === 'login') {
                      // Redirect to institute admin login page
                      navigate('/institute-admin/login');
                    } else {
                      setUserType('institute');
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${userType === 'institute'
                    ? 'border-purple-500 bg-purple-50 text-gray-900'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                    }`}
                >
                  <Building2 className="w-6 h-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Institute Admin</p>
                  <p className="text-xs mt-1 opacity-70">For organization</p>
                </button>
              </div>
            </div>
          )}

          {type === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="password"
                required
                className="w-full bg-white border border-gray-300 rounded-lg py-3 pl-10 pr-4 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          {/* Terms & Conditions Checkbox - Only for Signup */}
          {type === 'signup' && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-5 h-5 bg-white border-2 border-gray-300 rounded cursor-pointer checked:bg-primary-500 checked:border-primary-500 appearance-none transition-all"
                    required
                  />
                  {acceptedTerms && (
                    <CheckCircle className="w-4 h-4 text-white absolute pointer-events-none" />
                  )}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed flex-1">
                  I accept the{' '}
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms and Conditions
                  </a>
                  <span className="text-red-600 ml-1">*</span>
                </span>
              </label>
              {!acceptedTerms && (
                <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  You must accept the Terms and Conditions to continue
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || showWelcome || (type === 'signup' && !acceptedTerms)}
            className="w-full bg-gradient-to-r from-primary-500 to-purple-500 text-white font-bold py-3 rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                {type === 'login' ? 'Sign In' : 'Sign Up'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          {type === 'login' ? (
            <>Don't have an account? <Link to="/signup" className="text-primary-600 hover:underline font-semibold">Sign up</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-primary-600 hover:underline font-semibold">Login</Link></>
          )}
        </div>
      </div>

      {/* Add custom animation styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes loadingBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        .animate-loadingBar {
          animation: loadingBar 2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Auth;
