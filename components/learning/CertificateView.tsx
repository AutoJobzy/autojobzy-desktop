import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X, Download } from 'lucide-react';
import { Course } from './courseData';

interface CertificateViewProps {
  course: Course;
  userName: string;
  onClose: () => void;
}

const CertificateView: React.FC<CertificateViewProps> = ({ course, userName, onClose }) => {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-2xl w-full"
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Certificate Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-neon-blue/40 rounded-3xl p-1 shadow-[0_0_60px_rgba(0,243,255,0.15)]">
            <div className="bg-gradient-to-br from-[#0a0e1a] to-[#131826] rounded-[22px] p-10 text-center relative overflow-hidden">
              {/* Decorative corner lines */}
              {[
                'top-4 left-4 border-l-2 border-t-2',
                'top-4 right-4 border-r-2 border-t-2',
                'bottom-4 left-4 border-l-2 border-b-2',
                'bottom-4 right-4 border-r-2 border-b-2',
              ].map((cls, i) => (
                <div key={i} className={`absolute ${cls} border-neon-blue/30 w-8 h-8 rounded-sm`} />
              ))}

              {/* Glow blob */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,243,255,0.05),transparent_60%)] pointer-events-none" />

              {/* Award Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 mb-6 shadow-[0_0_30px_rgba(0,243,255,0.2)]"
              >
                <Award className="w-10 h-10 text-neon-blue" />
              </motion.div>

              {/* Header text */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <p className="text-gray-400 text-sm uppercase tracking-[0.3em] font-medium mb-2">
                  Certificate of Completion
                </p>
                <p className="text-gray-500 text-xs mb-6">This certifies that</p>

                {/* Name */}
                <h2 className="text-4xl font-bold text-white mb-2 font-heading">
                  {userName || 'Student'}
                </h2>
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent mx-auto mb-6" />

                <p className="text-gray-400 text-sm mb-3">has successfully completed</p>

                {/* Course name */}
                <div className="inline-flex items-center gap-2 bg-neon-blue/10 border border-neon-blue/20 rounded-xl px-5 py-2 mb-2">
                  <span className="text-xl">{course.icon}</span>
                  <span className="text-neon-blue font-bold text-lg">{course.title}</span>
                </div>

                <p className="text-gray-500 text-xs mt-4 mb-1">Level: {course.level} · {course.totalHours}</p>
                <p className="text-gray-600 text-xs">{today}</p>
              </motion.div>

              {/* Stars decoration */}
              {['-left-8 top-1/2', '-right-8 top-1/2', 'left-1/4 -top-4', 'right-1/4 -top-4'].map((pos, i) => (
                <motion.div
                  key={i}
                  className={`absolute ${pos} text-neon-blue/20 text-2xl pointer-events-none select-none`}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
                >
                  ✦
                </motion.div>
              ))}

              {/* AutoJobzy branding */}
              <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
                <div className="w-6 h-px bg-gray-600" />
                <span className="text-gray-500 text-xs">Issued by AutoJobzy Learning</span>
                <div className="w-6 h-px bg-gray-600" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
              Close
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-sm px-5 py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Save / Print
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CertificateView;
