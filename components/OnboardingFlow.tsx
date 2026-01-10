import React, { useState } from 'react';
import {
  CheckCircle,
  Play,
  Shield,
  AlertTriangle,
  Clock,
  Zap,
  TrendingUp,
  Settings,
  FileText,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to AutoJobzy",
      icon: <Zap className="w-16 h-16 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-300">
            Your intelligent job application automation platform
          </p>
          <div className="bg-dark-800 border border-white/10 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Save Time & Effort</h4>
                <p className="text-sm text-gray-400">
                  Automate repetitive job applications while you focus on interview preparation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">Smart Matching</h4>
                <p className="text-sm text-gray-400">
                  Our AI analyzes job descriptions to apply only to relevant positions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold mb-1">24/7 Automation</h4>
                <p className="text-sm text-gray-400">
                  Run automated applications at any time, even when you're offline
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "How It Works",
      icon: <Settings className="w-16 h-16 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Our automation follows a simple 3-step process:
          </p>
          <div className="space-y-4">
            <div className="bg-dark-800 border border-white/10 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <span className="text-red-500 font-bold">1</span>
                </div>
                <h4 className="text-white font-semibold">Configure Your Profile</h4>
              </div>
              <p className="text-sm text-gray-400 ml-11">
                Set your job preferences, target roles, salary expectations, and upload your resume
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-500 font-bold">2</span>
                </div>
                <h4 className="text-white font-semibold">Start Automation</h4>
              </div>
              <p className="text-sm text-gray-400 ml-11">
                Our bot logs into job portals, searches for matching jobs, and applies on your behalf
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-500 font-bold">3</span>
                </div>
                <h4 className="text-white font-semibold">Track Applications</h4>
              </div>
              <p className="text-sm text-gray-400 ml-11">
                Monitor all applications in your dashboard with detailed logs and match scores
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What to Expect",
      icon: <Play className="w-16 h-16 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Understanding automation behavior helps you get the best results:
          </p>
          <div className="space-y-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Intelligent Filtering</h4>
                  <p className="text-xs text-gray-400">
                    The bot analyzes each job posting and applies only to positions that match your profile (based on skills, experience, and location)
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Automated Form Filling</h4>
                  <p className="text-xs text-gray-400">
                    Application forms are filled using your saved profile data and resume information
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">AI-Powered Responses</h4>
                  <p className="text-xs text-gray-400">
                    When applications include chatbot questions, our AI generates appropriate responses based on your profile
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Processing Time</h4>
                  <p className="text-xs text-gray-400">
                    Typical automation runs process 20-50 applications per session, taking 15-30 minutes depending on job complexity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Your Responsibilities",
      icon: <Shield className="w-16 h-16 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            To get the best results and use the platform responsibly:
          </p>
          <div className="space-y-3">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Provide Accurate Information</h4>
                  <p className="text-xs text-gray-400">
                    Ensure your profile, resume, and job preferences are accurate and up-to-date. The automation quality depends on your input.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Review Application Logs</h4>
                  <p className="text-xs text-gray-400">
                    Regularly check your application history to ensure the bot is applying to appropriate positions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Keep Login Credentials Secure</h4>
                  <p className="text-xs text-gray-400">
                    Your Naukri credentials are encrypted and stored securely. Never share your account access with others.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Monitor Your Email</h4>
                  <p className="text-xs text-gray-400">
                    Companies will contact you via email for interview invitations. Check your inbox regularly to respond promptly.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm mb-1">Do Not Misuse</h4>
                  <p className="text-xs text-gray-400">
                    Use automation responsibly. Applying to irrelevant positions or spamming can harm your professional reputation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Best Practices",
      icon: <FileText className="w-16 h-16 text-orange-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            Follow these tips to maximize your success rate:
          </p>
          <div className="space-y-3">
            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Update Your Resume Regularly
              </h4>
              <p className="text-xs text-gray-400 ml-6">
                Keep your skills and experience current to match with the latest job requirements.
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Use Specific Job Keywords
              </h4>
              <p className="text-xs text-gray-400 ml-6">
                Set precise job titles and keywords to target relevant positions (e.g., "React Developer" instead of just "Developer").
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Set Realistic Filters
              </h4>
              <p className="text-xs text-gray-400 ml-6">
                Configure filters for location, salary, and company type to avoid applying to unsuitable positions.
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Run Automation During Off-Peak Hours
              </h4>
              <p className="text-xs text-gray-400 ml-6">
                Job portals perform better during non-peak hours (early morning or late evening).
              </p>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Review Match Scores
              </h4>
              <p className="text-xs text-gray-400 ml-6">
                Check application history to see which jobs had "Good Match" status and adjust your profile accordingly.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-900 border border-white/10 rounded-2xl max-w-3xl w-full shadow-2xl">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {currentStepData.icon}
              <div>
                <h2 className="text-2xl font-bold text-white">{currentStepData.title}</h2>
                <p className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-dark-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-red-500 w-8'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
          >
            {isLastStep ? (
              <>
                Get Started
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
