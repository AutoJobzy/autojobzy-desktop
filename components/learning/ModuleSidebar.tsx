import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, CheckCircle, Lock, PlayCircle, Clock } from 'lucide-react';
import { Course, Module, Topic } from './courseData';

interface ModuleSidebarProps {
  course: Course;
  completedTopicIds: string[];
  activeTopicId: string | null;
  onSelectTopic: (moduleId: string, topicId: string) => void;
}

function isTopicUnlocked(
  course: Course,
  completedIds: string[],
  moduleId: string,
  topicId: string
): boolean {
  let foundTarget = false;
  for (const mod of course.modules) {
    for (const topic of mod.topics) {
      if (mod.id === moduleId && topic.id === topicId) {
        foundTarget = true;
        break;
      }
      // Every topic before the target must be completed to unlock it
      if (!completedIds.includes(topic.id)) {
        // If we reach this topic before target, then target is locked
        // ... unless this IS the very first topic
        foundTarget = false;
      } else {
        foundTarget = true;
      }
    }
    if (mod.id === moduleId) break;
  }

  // Simpler: gather all topics in order; unlock if all previous are completed
  const allTopics: { moduleId: string; topicId: string }[] = [];
  for (const mod of course.modules) {
    for (const t of mod.topics) {
      allTopics.push({ moduleId: mod.id, topicId: t.id });
    }
  }
  const idx = allTopics.findIndex(t => t.moduleId === moduleId && t.topicId === topicId);
  if (idx === 0) return true; // first topic always unlocked
  // All previous must be completed
  return allTopics.slice(0, idx).every(t => completedIds.includes(t.topicId));
}

const ModuleItem: React.FC<{
  module: Module;
  course: Course;
  completedTopicIds: string[];
  activeTopicId: string | null;
  onSelectTopic: (moduleId: string, topicId: string) => void;
  defaultOpen: boolean;
}> = ({ module, course, completedTopicIds, activeTopicId, onSelectTopic, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen);

  const completedCount = module.topics.filter(t => completedTopicIds.includes(t.id)).length;
  const allDone = completedCount === module.topics.length;

  return (
    <div className="mb-1">
      {/* Module header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group text-left"
      >
        {allDone ? (
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          open ? (
            <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
          )
        )}
        <span className={`text-xs font-semibold flex-1 leading-tight ${allDone ? 'text-green-400' : 'text-gray-300'}`}>
          {module.title}
        </span>
        <span className="text-[10px] text-gray-600 flex-shrink-0">
          {completedCount}/{module.topics.length}
        </span>
      </button>

      {/* Topics */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pl-4"
          >
            {module.topics.map(topic => {
              const completed = completedTopicIds.includes(topic.id);
              const active = activeTopicId === topic.id;
              const unlocked = isTopicUnlocked(course, completedTopicIds, module.id, topic.id);

              return (
                <button
                  key={topic.id}
                  disabled={!unlocked}
                  onClick={() => unlocked && onSelectTopic(module.id, topic.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-0.5 transition-all text-left
                    ${active
                      ? 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
                      : completed
                        ? 'text-green-400 hover:bg-green-500/5'
                        : unlocked
                          ? 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                          : 'text-gray-700 cursor-not-allowed'
                    }`}
                >
                  {completed ? (
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                  ) : unlocked ? (
                    <PlayCircle className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-neon-blue' : 'text-gray-500'}`} />
                  ) : (
                    <Lock className="w-3.5 h-3.5 flex-shrink-0 text-gray-700" />
                  )}
                  <span className="text-xs flex-1 leading-tight">{topic.title}</span>
                  <span className="text-[10px] text-gray-600 flex-shrink-0 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {topic.duration}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ModuleSidebar: React.FC<ModuleSidebarProps> = ({
  course,
  completedTopicIds,
  activeTopicId,
  onSelectTopic,
}) => {
  // Find which module the active topic belongs to for auto-open
  const activeModuleId = course.modules.find(m =>
    m.topics.some(t => t.id === activeTopicId)
  )?.id;

  const totalTopics = course.modules.reduce((sum, m) => sum + m.topics.length, 0);
  const totalDone = completedTopicIds.length;
  const percent = totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Course header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{course.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{course.title}</h3>
            <p className="text-[10px] text-gray-500">{course.level} · {course.totalHours}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>{totalDone}/{totalTopics} completed</span>
            <span>{percent}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-blue to-neon-purple rounded-full"
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {course.modules.map((mod, i) => (
          <ModuleItem
            key={mod.id}
            module={mod}
            course={course}
            completedTopicIds={completedTopicIds}
            activeTopicId={activeTopicId}
            onSelectTopic={onSelectTopic}
            defaultOpen={mod.id === activeModuleId || i === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default ModuleSidebar;
