import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Mail, Building2, ArrowLeft, CheckCircle } from 'lucide-react';

const InstitutePending: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { instituteName?: string; adminEmail?: string } | null;

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-dark-900">
      <div className="w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        {/* Status Icon */}
        <div className="w-24 h-24 mx-auto mb-6 relative">
          <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Registration Pending Approval
        </h1>

        {/* Institute Name */}
        {state?.instituteName && (
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-neon-purple" />
            <p className="text-xl text-neon-purple font-semibold">
              {state.instituteName}
            </p>
          </div>
        )}

        {/* Message */}
        <p className="text-gray-400 text-lg mb-8">
          Thank you for registering your institute with us. Your application is currently under review.
        </p>

        {/* Info Cards */}
        <div className="space-y-4 mb-8">
          <div className="bg-dark-900 border border-white/10 rounded-lg p-6 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Email Notification</h3>
                <p className="text-gray-400 text-sm">
                  You will receive an email at <span className="text-neon-blue font-medium">{state?.adminEmail}</span> once your institute is approved.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-dark-900 border border-white/10 rounded-lg p-6 text-left">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">What's Next?</h3>
                <p className="text-gray-400 text-sm">
                  Our team will review your application within 24-48 hours. Once approved, you'll be able to:
                </p>
                <ul className="mt-2 space-y-1 text-gray-400 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neon-blue rounded-full"></div>
                    Login to your institute admin dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neon-blue rounded-full"></div>
                    Add and manage students
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neon-blue rounded-full"></div>
                    Assign staff members
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-neon-blue rounded-full"></div>
                    Monitor student progress
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            Need help or have questions? Contact us at{' '}
            <a href="mailto:support@jobzy.com" className="underline font-semibold">
              support@jobzy.com
            </a>
          </p>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-dark-900 border border-white/10 text-white rounded-lg hover:bg-dark-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default InstitutePending;
