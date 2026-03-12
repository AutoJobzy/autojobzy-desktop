import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  Award,
} from 'lucide-react';
import { Course, Topic, getProgress, saveProgress, getCourseCompletionPercent } from './courseData';
import ModuleSidebar from './ModuleSidebar';
import ConceptVisualizer from './ConceptVisualizer';
import CertificateView from './CertificateView';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  userName: string;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, userName }) => {
  const [completedIds, setCompletedIds] = useState<string[]>(() => getProgress(course.id));
  const [activeModuleId, setActiveModuleId] = useState<string>(course.modules[0]?.id ?? '');
  const [activeTopicId, setActiveTopicId] = useState<string>(course.modules[0]?.topics[0]?.id ?? '');
  const [showCertificate, setShowCertificate] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeTopic: Topic | undefined = course.modules
    .find(m => m.id === activeModuleId)
    ?.topics.find(t => t.id === activeTopicId);

  const percent = getCourseCompletionPercent(course, completedIds);
  const allDone = percent === 100;

  const handleSelectTopic = (moduleId: string, topicId: string) => {
    setActiveModuleId(moduleId);
    setActiveTopicId(topicId);
  };

  const handleMarkComplete = () => {
    if (!activeTopicId || completedIds.includes(activeTopicId)) return;
    const updated = [...completedIds, activeTopicId];
    setCompletedIds(updated);
    saveProgress(course.id, updated);

    // Auto-advance to next topic
    const allTopics: { moduleId: string; topicId: string }[] = [];
    for (const mod of course.modules) {
      for (const t of mod.topics) {
        allTopics.push({ moduleId: mod.id, topicId: t.id });
      }
    }
    const idx = allTopics.findIndex(t => t.topicId === activeTopicId);
    if (idx !== -1 && idx < allTopics.length - 1) {
      const next = allTopics[idx + 1];
      setActiveModuleId(next.moduleId);
      setActiveTopicId(next.topicId);
    }

    // Show certificate if this was last topic
    const newDone = updated.length;
    const total = course.modules.reduce((s, m) => s + m.topics.length, 0);
    if (newDone === total) {
      setTimeout(() => setShowCertificate(true), 600);
    }
  };

  const isCompleted = activeTopic ? completedIds.includes(activeTopic.id) : false;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden rounded-2xl border border-white/10 bg-gray-900/40 dark:bg-black/20">
      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gray-950/60 dark:bg-black/40 border-r border-white/10 overflow-hidden flex-shrink-0"
          >
            <div className="w-[280px] h-full">
              <ModuleSidebar
                course={course}
                completedTopicIds={completedIds}
                activeTopicId={activeTopicId}
                onSelectTopic={handleSelectTopic}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-white/10 bg-black/20 flex-shrink-0">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="text-gray-600 hover:text-gray-300 transition-colors text-xs border border-white/10 px-2 py-1 rounded"
          >
            {sidebarOpen ? '← Hide' : '→ Modules'}
          </button>
          <div className="flex-1 mx-2">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
          <span className="text-xs text-gray-500 flex-shrink-0">{percent}%</span>
          {allDone && (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs px-3 py-1.5 rounded-lg hover:bg-yellow-500/20 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Certificate
            </button>
          )}
        </div>

        {/* Topic content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTopic ? (
              <motion.div
                key={activeTopic.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-6 max-w-3xl mx-auto"
              >
                {/* Topic header */}
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span>{course.modules.find(m => m.id === activeModuleId)?.title}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-300">{activeTopic.title}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activeTopic.duration}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">{activeTopic.title}</h2>
                  <p className="text-gray-400 mt-1">{activeTopic.description}</p>
                </div>

                {/* Concept Visualizer */}
                <ConceptVisualizer
                  visualType={activeTopic.visualType}
                  title={activeTopic.title}
                />

                {/* Explanation */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                    How it works
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{activeTopic.explanation}</p>
                </div>

                {/* Code snippet */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wider">
                    Code Example
                  </h3>
                  <div className="bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/10 bg-black/30">
                      {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                        <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <pre className="p-4 text-sm font-mono text-gray-200 overflow-x-auto leading-6 whitespace-pre">
                      {activeTopic.codeSnippet}
                    </pre>
                  </div>
                </div>

                {/* Mark complete button */}
                <div className="flex items-center gap-3 pb-6">
                  {isCompleted ? (
                    <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-3 rounded-xl text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Topic Completed!
                    </div>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center gap-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-6 py-3 rounded-xl text-sm font-medium transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.15)] active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Complete & Continue
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a topic to begin
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateView
          course={course}
          userName={userName}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};

export default CoursePlayer;
