import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  color = 'bg-neon-blue',
  height = 6,
  showLabel = false,
}) => {
  return (
    <div className="w-full">
      <div
        className="w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-gray-500 mt-1 inline-block">{percent}% complete</span>
      )}
    </div>
  );
};

export default ProgressBar;
