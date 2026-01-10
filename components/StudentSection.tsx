import React from 'react';
import { Briefcase, Clock, Calendar, Rocket, Phone, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentSection: React.FC = () => {
  const benefits = [
    { icon: Clock, text: "Save 3+ hours daily on applications" },
    { icon: Calendar, text: "Built-in scheduler for automation" },
    { icon: Phone, text: "You just attend HR calls" },
    { icon: Target, text: "Track monthly time saved" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-3xl p-8 md:p-12 border border-indigo-500/30 relative overflow-hidden">

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/20 blur-[80px] rounded-full"></div>

          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple text-xs font-bold uppercase tracking-wider mb-4 border border-neon-purple/20">
                <Briefcase className="w-4 h-4" /> For All Job Seekers
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Perfect for Job Switchers, <br />IT Experts & Professionals
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Whether you're switching jobs, an IT professional, or from any field — Naukri's 50-application limit takes ~3 hours daily. We automate it all. You just provide basic info and attend HR calls.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 text-white"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                      <benefit.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              {/* Abstract Illustration Representation */}
              <div className="aspect-square relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-10 rotate-3"></div>
                <div className="absolute inset-0 bg-dark-900 rounded-2xl border border-white/10 p-6 flex flex-col justify-between -rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                        <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">Active</div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                        <div className="h-20 bg-gray-800 rounded w-full mt-4 border border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-xs">
                           Resume.pdf uploaded
                        </div>
                    </div>
                    <button className="w-full py-3 bg-neon-purple text-white rounded-lg font-bold mt-4 shadow-lg shadow-neon-purple/20">
                        Auto-Applying...
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentSection;
