import React, { useState } from 'react';
import { Sparkles, Rocket, Zap, Mail, TrendingUp, Lock, ArrowRight, Bell } from 'lucide-react';

const AdvancedPlanTeaser: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showNotifyPopup, setShowNotifyPopup] = useState(false);

  const features = [
    { icon: Rocket, text: 'Interview Prep Automation', locked: false },
    { icon: Mail, text: 'HR Outreach on Autopilot', locked: false },
    { icon: TrendingUp, text: 'Deep Automation Insights', locked: true },
    { icon: Zap, text: 'Advanced Controls', locked: true },
  ];

  const handleNotifyClick = () => {
    setShowNotifyPopup(true);
    setTimeout(() => setShowNotifyPopup(false), 3000);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Card */}
          <div className={`
            relative bg-gradient-to-br from-dark-800 via-dark-900 to-dark-800
            rounded-3xl border-2 overflow-hidden
            transition-all duration-500 ease-out
            ${isHovered
              ? 'border-neon-purple shadow-[0_0_60px_rgba(168,85,247,0.4)] scale-[1.02]'
              : 'border-neon-purple/40 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
            }
          `}>
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-pink-500 to-neon-purple opacity-20 blur-xl animate-pulse"></div>

            <div className="relative p-8 md:p-12">
              {/* Header with Badge */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div className="flex-1">
                  {/* Coming Soon Badge */}
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-neon-purple to-pink-500 text-white px-4 py-2 rounded-full mb-4 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold text-sm">COMING SOON</span>
                    <Sparkles className="w-4 h-4" />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl md:text-5xl font-heading font-bold mb-3">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-pink-500 to-neon-purple animate-gradient">
                      Advanced Automation
                    </span>
                  </h2>

                  {/* Subtitle */}
                  <p className="text-gray-400 text-lg md:text-xl italic">
                    For serious job seekers who want unfair advantage
                  </p>
                </div>

                {/* Price Badge */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-pink-500 rounded-2xl blur-xl opacity-50"></div>
                    <div className="relative bg-dark-900 border-2 border-neon-purple rounded-2xl px-8 py-6 text-center">
                      <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500">
                        ₹999
                      </div>
                      <div className="text-gray-400 text-sm mt-1">Premium Plan</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl
                      transition-all duration-300
                      ${feature.locked
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-gradient-to-r from-neon-purple/10 to-pink-500/10 border border-neon-purple/30'
                      }
                      ${isHovered && !feature.locked ? 'scale-105 border-neon-purple/50' : ''}
                    `}
                  >
                    <div className={`
                      p-3 rounded-lg
                      ${feature.locked
                        ? 'bg-white/5'
                        : 'bg-gradient-to-br from-neon-purple to-pink-500'
                      }
                    `}>
                      {feature.locked ? (
                        <Lock className="w-6 h-6 text-gray-500" />
                      ) : (
                        <feature.icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <span className={`font-medium ${feature.locked ? 'text-gray-500' : 'text-gray-200'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Benefits List */}
              <div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-neon-purple" />
                  What You'll Get (Plus Everything in Pro)
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span>Automated interview preparation tailored to your applications</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span>Direct HR outreach and follow-ups on autopilot</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span>Auto-update your email signatures and LinkedIn profile</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span className="text-pink-500 font-semibold">Advanced analytics dashboard (Exclusive)</span>
                  </li>
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={handleNotifyClick}
                  className="group relative px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 flex items-center gap-3"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-purple via-pink-500 to-neon-purple bg-[length:200%_100%] animate-gradient"></div>
                  <div className="relative flex items-center gap-3 text-white">
                    <Bell className="w-5 h-5" />
                    <span>Notify Me When Available</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <div className="text-gray-400 text-sm">
                  <span className="text-neon-purple font-semibold">2,847</span> people waiting
                </div>
              </div>

              {/* Success Popup */}
              {showNotifyPopup && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-neon-purple to-pink-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-bounce z-50">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    <span className="font-bold">You're on the waitlist! 🎉</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom shine effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent opacity-50"></div>
          </div>

          {/* Floating elements on hover */}
          {isHovered && (
            <>
              <div className="absolute -top-4 -right-4 animate-bounce">
                <div className="bg-gradient-to-br from-neon-purple to-pink-500 rounded-full p-3 shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 animate-bounce delay-150">
                <div className="bg-gradient-to-br from-pink-500 to-neon-purple rounded-full p-3 shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            🚀 Get ahead of the competition — be the first to access next-gen job automation
          </p>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </section>
  );
};

export default AdvancedPlanTeaser;
