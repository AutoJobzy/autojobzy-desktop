import React from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RefundPolicy: React.FC = () => {
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
            <RotateCcw className="w-8 h-8 text-indigo-500" />
            <h1 className="text-3xl font-bold text-white">Refund & Cancellation Policy</h1>
          </div>
          <p className="text-gray-400 mt-2">Last updated: December 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">1. Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              At AutoJobzy, we strive to provide the best job automation service. We understand
              that sometimes circumstances change, and we have established this Refund & Cancellation
              Policy to address such situations fairly. Please read this policy carefully before
              making a purchase.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">2. Refund Eligibility</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You may be eligible for a refund under the following conditions:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Request made within 48 hours of purchase</li>
              <li>No job applications have been submitted using our automation</li>
              <li>Technical issues on our end preventing service delivery</li>
              <li>Duplicate payment for the same subscription</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">3. Non-Refundable Situations</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Refunds will NOT be provided in the following cases:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Request made after 48 hours of purchase</li>
              <li>Service has been used (job applications submitted)</li>
              <li>Dissatisfaction with job search results (we don't guarantee placements)</li>
              <li>Change of mind after using the service</li>
              <li>Issues caused by incorrect credentials provided by user</li>
              <li>Account suspension due to violation of terms</li>
              <li>Third-party job portal issues beyond our control</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Refund Process</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside text-gray-300 space-y-2">
              <li>Email us at support@autojobzy.com with subject "Refund Request"</li>
              <li>Include your registered email address and order ID</li>
              <li>Provide a brief reason for the refund request</li>
              <li>Our team will review your request within 2-3 business days</li>
              <li>If approved, refund will be processed within 5-7 business days</li>
            </ol>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Refund Amount</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              The refund amount depends on when the request is made:
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <table className="w-full text-gray-300">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Time Period</th>
                    <th className="text-left py-2">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2">Within 24 hours (unused)</td>
                    <td className="py-2">100% refund</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2">24-48 hours (unused)</td>
                    <td className="py-2">90% refund</td>
                  </tr>
                  <tr>
                    <td className="py-2">After 48 hours</td>
                    <td className="py-2">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cancellation Policy</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You can cancel your subscription at any time:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Go to your Dashboard and click on "Manage Subscription"</li>
              <li>Or email us at support@autojobzy.com</li>
              <li>Cancellation stops future renewals only</li>
              <li>You will continue to have access until your current subscription period ends</li>
              <li>No partial refunds for remaining days after 48-hour window</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">7. Payment Gateway Fees</h2>
            <p className="text-gray-300 leading-relaxed">
              Please note that payment gateway fees (charged by Razorpay) are non-refundable.
              In case of approved refunds, the payment gateway fee (approximately 2-3% of the
              transaction amount) may be deducted from the refund amount.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">8. Processing Time</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Refund processing times:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Review period: 2-3 business days</li>
              <li>Refund initiation: Within 24 hours of approval</li>
              <li>Credit to bank account: 5-7 business days</li>
              <li>Credit to UPI: 1-2 business days</li>
              <li>Credit card refunds may take up to 10 business days</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">9. Disputes</h2>
            <p className="text-gray-300 leading-relaxed">
              If you believe your refund request was unfairly denied, you may escalate the matter
              by emailing disputes@autojobzy.com with detailed information. Our management team
              will review your case and respond within 5 business days. All decisions made by the
              management team are final.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed">
              For refund or cancellation requests, please contact us:
            </p>
            <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-300">Email: support@autojobzy.com</p>
              <p className="text-gray-300">Phone: +91 98765 43210</p>
              <p className="text-gray-300 mt-2 text-sm">Business Hours: Mon-Sat, 10:00 AM - 6:00 PM IST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
