import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe, User as UserIcon, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface InstituteSignupData {
  instituteName: string;
  instituteEmail: string;
  institutePhone: string;
  instituteAddress: string;
  instituteWebsite: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

const InstituteSignup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get prefilled data from navigation state
  const locationState = location.state as {
    prefillData?: {
      adminFirstName: string;
      adminLastName: string;
      adminEmail: string;
      adminPassword: string;
    }
  } | null;

  const [formData, setFormData] = useState<InstituteSignupData>({
    instituteName: '',
    instituteEmail: '',
    institutePhone: '',
    instituteAddress: '',
    instituteWebsite: '',
    adminFirstName: locationState?.prefillData?.adminFirstName || '',
    adminLastName: locationState?.prefillData?.adminLastName || '',
    adminEmail: locationState?.prefillData?.adminEmail || '',
    adminPassword: locationState?.prefillData?.adminPassword || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

      // Validate all fields
      if (!formData.instituteName.trim() || !formData.instituteEmail.trim() ||
        !formData.adminFirstName.trim() || !formData.adminLastName.trim() ||
        !formData.adminEmail.trim() || !formData.adminPassword.trim()) {
        throw new Error('Please fill in all required fields');
      }

      if (formData.adminPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Submit institute signup request
      const response = await fetch(`${API_BASE_URL}/auth/institute-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);

      // Redirect to pending approval page after 2 seconds
      setTimeout(() => {
        navigate('/institute-pending', {
          state: {
            instituteName: formData.instituteName,
            adminEmail: formData.adminEmail,
          }
        });
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[100px]"></div>

      {/* Success Overlay */}
      {success && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 border border-neon-green/50 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 bg-neon-green/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-gradient-to-br from-neon-green to-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
            <p className="text-gray-400">
              Your institute registration request has been submitted. Our team will review and approve it shortly.
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-12 h-12 text-neon-purple" />
            <h2 className="text-3xl font-heading font-bold text-white">Institute Registration</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Register your educational institute to manage students and staff
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Institute Details Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-neon-purple" />
              Institute Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Institute Name *</label>
                <div className="relative mt-2">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    placeholder="ABC Engineering College"
                    value={formData.instituteName}
                    onChange={e => setFormData({ ...formData, instituteName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Institute Email *</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    placeholder="contact@institute.edu"
                    value={formData.instituteEmail}
                    onChange={e => setFormData({ ...formData, instituteEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    placeholder="+91 1234567890"
                    value={formData.institutePhone}
                    onChange={e => setFormData({ ...formData, institutePhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    placeholder="123 Education Street, City"
                    value={formData.instituteAddress}
                    onChange={e => setFormData({ ...formData, instituteAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Website</label>
                <div className="relative mt-2">
                  <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="url"
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none transition-all"
                    placeholder="https://www.institute.edu"
                    value={formData.instituteWebsite}
                    onChange={e => setFormData({ ...formData, instituteWebsite: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Details Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-neon-blue" />
              Admin User Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name *</label>
                <div className="relative mt-2">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    placeholder="John"
                    value={formData.adminFirstName}
                    onChange={e => setFormData({ ...formData, adminFirstName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name *</label>
                <div className="relative mt-2">
                  <UserIcon className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    placeholder="Doe"
                    value={formData.adminLastName}
                    onChange={e => setFormData({ ...formData, adminLastName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email *</label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    placeholder="admin@institute.edu"
                    value={formData.adminEmail}
                    onChange={e => setFormData({ ...formData, adminEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password *</label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    required
                    className="w-full bg-dark-900 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.adminPassword}
                    onChange={e => setFormData({ ...formData, adminPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-400 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Your registration will be reviewed by our team. You will receive an email once your institute is approved.
                The admin user will be able to login only after approval.
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-neon-purple to-purple-600 text-white font-bold py-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <>
                Submit Registration <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InstituteSignup;
