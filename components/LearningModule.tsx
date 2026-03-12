import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Search, Trophy } from 'lucide-react';
import { courses, Course } from './learning/courseData';
import CourseCard from './learning/CourseCard';
import CoursePlayer from './learning/CoursePlayer';

const LearningModule: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        if (name) setUserName(name);
      }
    } catch {}
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (courseId: string) => {
    const c = courses.find(c => c.id === courseId);
    if (c) setSelectedCourse(c);
  };

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {selectedCourse ? (
          <motion.div
            key="player"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            <CoursePlayer
              course={selectedCourse}
              onBack={() => setSelectedCourse(null)}
              userName={userName}
            />
          </motion.div>
        ) : (
          <motion.div
            key="catalog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto px-4 py-6 space-y-8"
          >
            {/* Hero header */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black/60 dark:to-gray-900 border border-white/10 rounded-3xl p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,243,255,0.06),transparent_60%)] pointer-events-none" />
              <div className="relative flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-neon-blue/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-7 h-7 text-neon-blue" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, <span className="text-neon-blue">{userName}</span> 👋
                  </h1>
                  <p className="text-gray-400 text-sm mt-1">
                    Master in-demand tech skills with animated, step-by-step courses.
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="relative mt-6 flex gap-6 flex-wrap">
                {[
                  { label: 'Courses Available', value: courses.length },
                  { label: 'Total Hours', value: '105+ hrs' },
                  { label: 'Topics', value: courses.reduce((s, c) => s + c.modules.reduce((ms, m) => ms + m.topics.length, 0), 0) },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/20 transition-all"
              />
            </div>

            {/* Course grid */}
            {filtered.length > 0 ? (
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  All Courses
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((course, i) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.3 }}
                    >
                      <CourseCard course={course} onSelect={handleSelect} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No courses found for "{search}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningModule;
