import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to AutoJobzy ("we," "our," or "us"). We are committed to protecting your
              personal information and your right to privacy. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you use our job automation
              service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Account information (name, email address, password)</li>
              <li>Profile information (resume, skills, experience)</li>
              <li>Job preferences (target role, location, salary expectations)</li>
              <li>Job portal credentials (stored securely and encrypted)</li>
              <li>Payment information (processed securely via Razorpay)</li>
              <li>Usage data and automation logs</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-300 leading-relaxed mb-4">We use the collected information to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide and maintain our job automation service</li>
              <li>Process job applications on your behalf</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send you updates about your applications and service</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              We implement industry-standard security measures to protect your personal information.
              Your job portal credentials are encrypted using AES-256 encryption and are only
              decrypted during active automation sessions. We use secure HTTPS connections for all
              data transmissions. Payment processing is handled by Razorpay, a PCI-DSS compliant
              payment gateway.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>With your explicit consent</li>
              <li>With payment processors (Razorpay) to complete transactions</li>
              <li>To comply with legal requirements or court orders</li>
              <li>To protect our rights, privacy, safety, or property</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information for as long as your account is active or as needed
              to provide you services. You can request deletion of your account and associated data
              at any time by contacting us.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies</h2>
            <p className="text-gray-300 leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our service and
              hold certain information. You can instruct your browser to refuse all cookies or to
              indicate when a cookie is being sent.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300">Email: support@autojobzy.com</p>
              <p className="text-gray-300">Phone: +91 98765 43210</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
