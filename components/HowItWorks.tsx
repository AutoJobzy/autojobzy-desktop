import React from 'react';
import { STEPS } from '../constants';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-black relative overflow-hidden">
      {/* Connecting line */}
      <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent -translate-y-12"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">How It Works</h2>
          <p className="text-gray-400">Minimal setup. Maximum results. You focus on interviews — we handle applications.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {STEPS.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="relative group"
            >
              <div className="bg-dark-800 p-8 rounded-2xl border border-white/10 h-full hover:bg-dark-700 transition-colors text-center relative z-20">
                <div className="w-16 h-16 mx-auto rounded-full bg-neon-blue/10 flex items-center justify-center mb-6 border border-neon-blue/30 group-hover:border-neon-blue group-hover:shadow-[0_0_20px_rgba(0,243,255,0.3)] transition-all">
                  <step.icon className="w-8 h-8 text-neon-blue" />
                </div>
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-neon-purple text-white flex items-center justify-center font-bold text-sm border-2 border-black">
                  {step.id}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
