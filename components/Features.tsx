import React from 'react';
import { FEATURES } from '../constants';
import { motion } from 'framer-motion';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-dark-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-neon-blue font-bold tracking-wide uppercase text-sm mb-2">Why AutoJobzy?</h2>
          <h3 className="text-3xl md:text-4xl font-heading font-bold text-white">
            You Provide Info. <span className="text-neon-green">We Handle the Rest.</span>
          </h3>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            All built-in techniques for efficient job applications. Save 3+ hours daily and focus on what matters — attending HR calls and acing interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-dark-800 border border-white/5 hover:border-neon-blue/50 transition-all duration-300 group hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-neon-blue group-hover:text-neon-green transition-colors" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
