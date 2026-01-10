import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const InstituteAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();

      // Verify user is institute_admin
      if (data.user.role !== 'institute_admin') {
        throw new Error('Access denied. This login is only for Institute Admins.');
      }

      // Store token and user data with institute-admin specific keys
      localStorage.setItem('instituteAdminToken', data.token);
      localStorage.setItem('instituteAdminUser', JSON.stringify(data.user));

      toast.success(`Welcome, ${data.user.firstName}!`);

      // Redirect directly to institute admin dashboard
      navigate('/institute-admin');
    } catch (err: any) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Home</span>
        </button>

        <div className="bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-neon-purple/10 border border-neon-purple/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-neon-purple" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white mb-2">
              Institute Admin Login
            </h1>
            <p className="text-gray-400 text-sm">
              Access your institute management dashboard
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                  placeholder="admin@institute.edu"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-purple hover:bg-purple-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-neon-purple font-semibold text-sm">Institute Admin Access</p>
                <p className="text-gray-400 text-xs mt-1">
                  This login is exclusively for institute administrators. If you're a student or individual user, please use the regular login page.
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Not an institute admin?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-neon-blue hover:underline"
              >
                Login as User
              </button>
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Want to register your institute?{' '}
              <button
                onClick={() => navigate('/institute-signup')}
                className="text-neon-purple hover:underline"
              >
                Register Here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteAdminLogin;
