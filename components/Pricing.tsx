import React from 'react';
import { Check, Lock, Sparkles } from 'lucide-react';
import { PRICING_PLANS } from '../constants';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">Simple Pricing</h2>
          <p className="text-gray-400">Invest in your career for less than the price of a pizza.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-dark-800 rounded-2xl border p-8 transition-transform duration-300 ${
                plan.comingSoon
                  ? 'border-neon-purple shadow-[0_0_40px_rgba(168,85,247,0.25)] overflow-hidden'
                  : plan.isPopular
                    ? 'border-neon-blue shadow-[0_0_30px_rgba(0,243,255,0.15)] z-10 scale-105 hover:scale-105'
                    : 'border-white/10 hover:border-gray-500 hover:scale-105'
              }`}
            >
              {/* Coming Soon Badge with Sparkles */}
              {plan.comingSoon && (
                <>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-neon-purple to-pink-500 text-white font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 animate-pulse">
                    <Sparkles className="w-4 h-4" />
                    Coming Soon
                    <Sparkles className="w-4 h-4" />
                  </div>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-pink-500/5 pointer-events-none"></div>
                </>
              )}

              {/* Most Popular Badge */}
              {plan.isPopular && !plan.comingSoon && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neon-blue text-black font-bold px-4 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.comingSoon ? 'text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500' : 'text-white'}`}>
                {plan.name}
              </h3>

              {plan.subtitle && (
                <p className="text-gray-400 text-sm mb-4 italic">{plan.subtitle}</p>
              )}

              <div className="flex items-baseline mb-6">
                <span className={`text-4xl font-bold ${plan.comingSoon ? 'text-neon-purple' : 'text-white'}`}>
                  {plan.price}
                </span>
                <span className="text-gray-400 ml-2">
                  {plan.comingSoon ? (
                    <span className="text-neon-purple font-semibold">{plan.duration}</span>
                  ) : (
                    `/ ${plan.duration}`
                  )}
                </span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    {plan.comingSoon && feature.includes('🔒') ? (
                      <Lock className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                    ) : (
                      <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.comingSoon ? 'text-neon-purple' : 'text-neon-green'}`} />
                    )}
                    <span className={`text-sm ${plan.comingSoon ? 'text-gray-300' : 'text-gray-300'}`}>
                      {feature.replace('✔ ', '').replace('🔒 ', '')}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.comingSoon}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  plan.comingSoon
                    ? 'bg-gradient-to-r from-neon-purple to-pink-500 text-white cursor-not-allowed opacity-60 hover:opacity-75'
                    : plan.isPopular
                      ? 'bg-neon-blue text-black hover:bg-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
              }`}>
                {plan.comingSoon ? (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Notify Me When Available
                  </span>
                ) : (
                  'Get Started'
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
