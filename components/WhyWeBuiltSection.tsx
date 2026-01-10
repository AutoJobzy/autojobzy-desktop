import React from 'react';
import { Clock, ArrowRight, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const WhyWeBuiltSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-neon-blue/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-neon-purple/5 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-neon-blue text-sm font-medium mb-6">
              <Clock className="w-4 h-4" />
              Save 3+ Hours Daily
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6 leading-tight">
              Naukri Takes 3 Hours Daily.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                We Built This to Give That Time Back.
              </span>
            </h2>

            <p className="text-gray-400 text-lg mb-6 leading-relaxed">
              Naukri.com has a 50-application daily limit. Manually reviewing jobs and applying takes ~3 hours every single day. That's 90+ hours monthly spent on repetitive tasks.
            </p>

            <p className="text-gray-400 mb-8 leading-relaxed">
              AutoJobzy was built to solve this. You provide basic info — skills, experience, preferences — and our app handles everything automatically. Built-in scheduler, monthly tracking, and you just attend HR calls.
            </p>

            <Link to="/why-we-built">
              <button className="group bg-gradient-to-r from-neon-blue to-neon-purple text-white px-8 py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-2">
                Read Our Full Story
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>

          {/* Right Content - Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-green/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-green/10 rounded-lg group-hover:bg-neon-green/20 transition-colors">
                  <Clock className="w-6 h-6 text-neon-green" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Save 3+ Hours Every Day</h3>
                  <p className="text-gray-400 text-sm">
                    Naukri's 50-application limit takes ~3 hours manually. Our app does it automatically while you prepare for interviews or attend HR calls.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-purple/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-purple/10 rounded-lg group-hover:bg-neon-purple/20 transition-colors">
                  <Calendar className="w-6 h-6 text-neon-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Built-in Scheduler</h3>
                  <p className="text-gray-400 text-sm">
                    Schedule applications around your availability. The app works automatically — you focus on what matters: interviews and HR calls.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-800/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-neon-blue/30 transition-all group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neon-blue/10 rounded-lg group-hover:bg-neon-blue/20 transition-colors">
                  <Target className="w-6 h-6 text-neon-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Track Monthly Time Saved</h3>
                  <p className="text-gray-400 text-sm">
                    See exactly how many applications submitted and calculate days of time saved each month. Real ROI, visible results.
                  </p>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="mt-6 p-4 border-l-4 border-neon-blue bg-dark-800/50 rounded-r-lg">
              <p className="text-gray-300 italic">
                "You provide basic info. We handle applications. You just attend HR calls."
              </p>
              <p className="text-neon-blue text-sm mt-2">— AutoJobzy</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeBuiltSection;
