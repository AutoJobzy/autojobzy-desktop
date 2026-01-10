import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions: React.FC = () => {
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
            <FileText className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using AutoJobzy ("Service"), you accept and agree to be bound by these
              Terms and Conditions. If you do not agree to these terms, please do not use our Service.
              These terms apply to all visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p className="text-gray-300 leading-relaxed">
              AutoJobzy is a job application automation platform that helps users streamline their
              job search process. Our Service automates the process of applying to jobs on various
              job portals based on user preferences and credentials provided by the user. The Service
              requires users to provide their job portal login credentials, which are stored securely
              and used solely for automation purposes.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To use our Service, you must:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Responsibilities</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              By using our Service, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Provide valid and accurate job portal credentials</li>
              <li>Ensure your resume and profile information is accurate</li>
              <li>Comply with the terms of service of all job portals accessed</li>
              <li>Not use the Service for any illegal or unauthorized purpose</li>
              <li>Not interfere with or disrupt the Service or servers</li>
              <li>Not attempt to gain unauthorized access to any part of the Service</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Subscription and Payments</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Our Service operates on a subscription basis:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Subscription fees are charged in advance for the chosen plan duration</li>
              <li>All payments are processed securely through Razorpay</li>
              <li>Prices are listed in Indian Rupees (INR) and include applicable taxes</li>
              <li>We reserve the right to modify pricing with prior notice</li>
              <li>Subscriptions are non-transferable</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Service Limitations</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Please note the following limitations:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>We do not guarantee job placement or interview calls</li>
              <li>Success depends on your profile, qualifications, and market conditions</li>
              <li>Service availability may vary based on job portal accessibility</li>
              <li>We are not responsible for changes in job portal interfaces or policies</li>
              <li>Automation limits are based on your subscription plan</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service and its original content, features, and functionality are owned by
              AutoJobzy and are protected by international copyright, trademark, patent, trade
              secret, and other intellectual property laws. You may not copy, modify, distribute,
              sell, or lease any part of our Service without explicit written permission.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-gray-300 leading-relaxed">
              The Service is provided "as is" and "as available" without any warranties of any kind,
              either express or implied. We do not warrant that the Service will be uninterrupted,
              timely, secure, or error-free. We do not make any warranties as to the results that
              may be obtained from the use of the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-300 leading-relaxed">
              In no event shall AutoJobzy, its directors, employees, partners, agents, suppliers,
              or affiliates be liable for any indirect, incidental, special, consequential, or
              punitive damages, including without limitation, loss of profits, data, use, goodwill,
              or other intangible losses, resulting from your access to or use of the Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
            <p className="text-gray-300 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability,
              for any reason, including breach of these Terms. Upon termination, your right to use
              the Service will immediately cease. You may also terminate your account at any time
              by contacting us.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
            <p className="text-gray-300 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India,
              without regard to its conflict of law provisions. Any disputes arising under these
              Terms shall be subject to the exclusive jurisdiction of courts in [Your City], India.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. We will provide
              notice of any changes by posting the new Terms on this page. Your continued use of
              the Service after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
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

export default TermsConditions;
