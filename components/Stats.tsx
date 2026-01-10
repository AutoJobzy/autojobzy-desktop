import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Hours Saved Daily', value: '3+', color: 'text-neon-green' },
  { label: 'Days Saved Monthly', value: '12+', color: 'text-neon-blue' },
  { label: 'Applications/Month', value: '1,500+', color: 'text-neon-purple' },
  { label: 'Active Job Seekers', value: '5,000+', color: 'text-white' },
];

const Stats: React.FC = () => {
  return (
    <div className="py-10 bg-dark-800 border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl -translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="p-4"
            >
              <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-2`}>
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm md:text-base font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
