import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, BarChart2, PlayCircle, CheckCircle } from 'lucide-react';
import { Course, getProgress, getCourseCompletionPercent } from './courseData';
import ProgressBar from './ProgressBar';

interface CourseCardProps {
  course: Course;
  onSelect: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const completed = getProgress(course.id);
  const percent = getCourseCompletionPercent(course, completed);
  const totalTopics = course.modules.reduce((s, m) => s + m.topics.length, 0);
  const allDone = percent === 100;

  const levelColor: Record<string, string> = {
    Beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
    Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="relative bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-neon-blue/5 transition-shadow cursor-pointer group"
      onClick={() => onSelect(course.id)}
    >
      {/* Gradient header */}
      <div className={`bg-gradient-to-r ${course.color} h-2`} />

      <div className="p-5">
        {/* Icon + badges */}
        <div className="flex items-start justify-between mb-3">
          <span className="text-4xl leading-none">{course.icon}</span>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${levelColor[course.level]}`}>
              {course.level}
            </span>
            {allDone && (
              <span className="text-[10px] font-semibold border text-yellow-400 bg-yellow-400/10 border-yellow-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5" /> Done
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight mb-1">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 leading-snug mb-4">{course.subtitle}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.modules.length} modules
          </span>
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" />
            {totalTopics} topics
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.totalHours}
          </span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5 mb-4">
          <ProgressBar percent={percent} showLabel />
        </div>

        {/* CTA */}
        <button
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${allDone
              ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
              : percent > 0
                ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue hover:bg-neon-blue/20'
                : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
            }`}
        >
          <PlayCircle className="w-4 h-4" />
          {allDone ? 'Review Course' : percent > 0 ? 'Continue Learning' : 'Start Course'}
        </button>
      </div>
    </motion.div>
  );
};

export default CourseCard;
