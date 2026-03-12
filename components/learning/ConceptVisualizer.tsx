import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { VisualType } from './courseData';

interface ConceptVisualizerProps {
  visualType: VisualType;
  title: string;
}

/* ─────────────────────────────────────────
   Memory Model (Stack + Heap)
───────────────────────────────────────── */
const MemoryModel: React.FC<{ playing: boolean }> = ({ playing }) => {
  const stackItems = [
    { label: 'age = 25', color: 'bg-blue-500' },
    { label: 'salary = 50000.0', color: 'bg-green-500' },
    { label: 'name → 0xFF01', color: 'bg-purple-500' },
  ];
  const heapItems = [
    { label: '"John"', color: 'border-purple-400 text-purple-300' },
    { label: 'int[]{90,85}', color: 'border-cyan-400 text-cyan-300' },
  ];

  return (
    <div className="flex gap-6 justify-center items-start py-4">
      {/* Stack */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Stack</span>
        <div className="border border-blue-500/40 rounded-lg p-3 w-44 space-y-2 bg-blue-500/5">
          {stackItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={playing ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ delay: i * 0.3, duration: 0.4 }}
              className={`${item.color} text-white text-xs px-3 py-2 rounded-md font-mono`}
            >
              {item.label}
            </motion.div>
          ))}
        </div>
        <span className="text-[10px] text-gray-500">fast, limited</span>
      </div>

      {/* Arrow */}
      <div className="flex items-center mt-10">
        <motion.div
          animate={playing ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.3 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-purple-400 text-lg"
        >
          →
        </motion.div>
      </div>

      {/* Heap */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Heap</span>
        <div className="border border-purple-500/40 rounded-lg p-3 w-44 space-y-2 bg-purple-500/5">
          {heapItems.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.6 + i * 0.3, duration: 0.4 }}
              className={`border ${item.color} text-xs px-3 py-2 rounded-md font-mono bg-black/20`}
            >
              {item.label}
            </motion.div>
          ))}
        </div>
        <span className="text-[10px] text-gray-500">large, garbage-collected</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Flowchart
───────────────────────────────────────── */
const FlowChart: React.FC<{ playing: boolean }> = ({ playing }) => {
  const nodes = [
    { label: 'Start', color: 'bg-gray-600', delay: 0 },
    { label: 'score >= 90?', color: 'bg-yellow-600', delay: 0.3 },
    { label: 'score >= 80?', color: 'bg-yellow-600', delay: 0.6 },
    { label: 'Print "B"', color: 'bg-green-600', delay: 0.9 },
    { label: 'End', color: 'bg-gray-600', delay: 1.2 },
  ];

  return (
    <div className="flex flex-col items-center gap-1 py-4">
      {nodes.map((node, i) => (
        <React.Fragment key={node.label}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: node.delay, duration: 0.35 }}
            className={`${node.color} text-white text-xs px-5 py-2 rounded-md font-mono min-w-[140px] text-center`}
          >
            {node.label}
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={playing ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: node.delay + 0.2, duration: 0.2 }}
              className="text-gray-500 text-lg leading-none"
            >
              ↓
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Stack Frame
───────────────────────────────────────── */
const StackFrameVisual: React.FC<{ playing: boolean }> = ({ playing }) => {
  const frames = [
    { name: 'add(3, 4)', vars: ['a = 3', 'b = 4', 'return 7'], color: 'border-cyan-500/50 bg-cyan-500/5', delay: 0.4 },
    { name: 'main()', vars: ['result = ?', '...'], color: 'border-blue-500/50 bg-blue-500/5', delay: 0 },
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <span className="text-xs text-gray-400 mb-2">Call Stack (grows upward)</span>
      {frames.map((frame, i) => (
        <motion.div
          key={frame.name}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={playing ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
          transition={{ delay: frame.delay, duration: 0.4, transformOrigin: 'bottom' }}
          className={`border ${frame.color} rounded-lg p-3 w-52`}
        >
          <div className="text-xs font-bold text-white mb-1 font-mono">{frame.name}</div>
          {frame.vars.map(v => (
            <div key={v} className="text-xs text-gray-300 font-mono pl-2">• {v}</div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Class Hierarchy
───────────────────────────────────────── */
const ClassHierarchy: React.FC<{ playing: boolean }> = ({ playing }) => {
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {/* Parent */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="border border-orange-500/60 bg-orange-500/10 text-orange-300 rounded-lg px-8 py-3 font-mono text-sm font-bold"
      >
        Animal
        <div className="text-xs font-normal text-orange-400 mt-1">eat(), sleep()</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={playing ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 text-2xl"
      >
        |
      </motion.div>

      {/* extends arrow */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={playing ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex gap-8"
      >
        {[
          { name: 'Dog', methods: 'bark()', color: 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300' },
          { name: 'Cat', methods: 'meow()', color: 'border-purple-500/60 bg-purple-500/10 text-purple-300' },
        ].map(cls => (
          <div key={cls.name} className={`border ${cls.color} rounded-lg px-6 py-2 font-mono text-sm font-bold text-center`}>
            {cls.name}
            <div className="text-xs font-normal mt-1 opacity-70">{cls.methods}</div>
            <div className="text-[10px] mt-1 opacity-50">inherits eat(), sleep()</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

/* ─────────────────────────────────────────
   HashMap Visualization
───────────────────────────────────────── */
const HashMapVisual: React.FC<{ playing: boolean }> = ({ playing }) => {
  const entries = [
    { key: '"apple"', hash: '→ h() → 3', bucket: 3, color: 'text-green-400' },
    { key: '"banana"', hash: '→ h() → 7', bucket: 7, color: 'text-yellow-400' },
    { key: '"cherry"', hash: '→ h() → 3', bucket: 3, color: 'text-red-400', collision: true },
  ];
  const buckets = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="flex gap-6 items-start py-4 justify-center">
      {/* Keys + hash */}
      <div className="space-y-3">
        <div className="text-xs text-gray-400 font-bold uppercase mb-2">Keys</div>
        {entries.map((e, i) => (
          <motion.div
            key={e.key}
            initial={{ opacity: 0, x: -15 }}
            animate={playing ? { opacity: 1, x: 0 } : { opacity: 0, x: -15 }}
            transition={{ delay: i * 0.5, duration: 0.35 }}
            className={`font-mono text-xs ${e.color} flex items-center gap-1`}
          >
            <span className="bg-black/30 border border-white/10 px-2 py-1 rounded">{e.key}</span>
            <span className="text-gray-500 text-[10px]">{e.hash}</span>
            {e.collision && <span className="text-orange-400 text-[10px]">⚠ collision</span>}
          </motion.div>
        ))}
      </div>

      {/* Buckets */}
      <div>
        <div className="text-xs text-gray-400 font-bold uppercase mb-2">Buckets</div>
        <div className="border border-white/10 rounded-lg overflow-hidden">
          {buckets.map(b => {
            const items = entries.filter(e => e.bucket === b);
            return (
              <div key={b} className="flex items-center gap-2 border-b border-white/5 last:border-0 px-3 py-1.5 min-w-[180px]">
                <span className="text-[10px] text-gray-600 w-4">{b}</span>
                <div className="flex gap-1">
                  {items.map((item, idx) => (
                    <motion.span
                      key={item.key}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                      transition={{ delay: entries.indexOf(item) * 0.5 + 0.2, duration: 0.3 }}
                      className={`font-mono text-[10px] ${item.color} bg-black/30 px-1.5 py-0.5 rounded`}
                    >
                      {item.key}
                      {idx < items.length - 1 && <span className="text-gray-500"> →</span>}
                    </motion.span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Linked List
───────────────────────────────────────── */
const LinkedListVisual: React.FC<{ playing: boolean }> = ({ playing }) => {
  const nodes = [0, 1, 2, 3];

  return (
    <div className="flex items-center gap-1 justify-center py-8">
      <div className="text-xs text-gray-400 absolute -translate-y-8">null ← head</div>
      {nodes.map((val, i) => (
        <React.Fragment key={val}>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={playing ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ delay: i * 0.3, duration: 0.35 }}
            className="border border-cyan-500/50 bg-cyan-500/5 rounded-lg p-3 text-center min-w-[60px]"
          >
            <div className="text-cyan-300 font-bold font-mono">{val}</div>
            <div className="text-[9px] text-gray-500 mt-1">data</div>
            <div className="text-[9px] text-gray-500">prev | next</div>
          </motion.div>
          {i < nodes.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={playing ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
              transition={{ delay: i * 0.3 + 0.2, duration: 0.2 }}
              className="text-cyan-600 font-bold"
            >
              ↔
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Array Resize
───────────────────────────────────────── */
const ArrayResizeVisual: React.FC<{ playing: boolean }> = ({ playing }) => {
  const phases = [
    { label: 'Initial capacity: 4', cells: ['A', 'B', 'C', 'D', '', ''], step: 0 },
    { label: 'Full! Growing to 6…', cells: ['A', 'B', 'C', 'D', 'E', ''], step: 1 },
    { label: 'New array (×1.5) copied', cells: ['A', 'B', 'C', 'D', 'E', 'F'], step: 2 },
  ];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!playing) { setPhase(0); return; }
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [playing]);

  const cur = phases[phase];

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <motion.p
        key={cur.label}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-xs text-gray-400"
      >
        {cur.label}
      </motion.p>
      <div className="flex gap-1">
        {cur.cells.map((c, i) => (
          <motion.div
            key={i}
            layout
            animate={{
              borderColor: c ? '#00f3ff' : 'rgba(255,255,255,0.1)',
              backgroundColor: c ? 'rgba(0,243,255,0.08)' : 'rgba(0,0,0,0.2)',
            }}
            className="border rounded-md w-10 h-10 flex items-center justify-center font-mono text-sm text-cyan-300"
          >
            {c}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   Stream Pipeline
───────────────────────────────────────── */
const StreamPipeline: React.FC<{ playing: boolean }> = ({ playing }) => {
  const stages = [
    { label: 'source', value: '[1,2,3,4,5,6]', color: 'bg-gray-600' },
    { label: 'filter(even)', value: '[2,4,6]', color: 'bg-blue-700' },
    { label: 'map(n²)', value: '[4,16,36]', color: 'bg-purple-700' },
    { label: 'reduce(sum)', value: '56', color: 'bg-green-700' },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap justify-center py-6">
      {stages.map((s, i) => (
        <React.Fragment key={s.label}>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={playing ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            transition={{ delay: i * 0.5, duration: 0.35 }}
            className={`${s.color} rounded-xl p-3 text-center min-w-[80px]`}
          >
            <div className="text-[10px] text-white/60 uppercase tracking-wide">{s.label}</div>
            <div className="text-xs font-mono text-white mt-1">{s.value}</div>
          </motion.div>
          {i < stages.length - 1 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={playing ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: i * 0.5 + 0.3 }}
              className="text-gray-500 text-xl"
            >
              →
            </motion.span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Exception Flow
───────────────────────────────────────── */
const ExceptionFlow: React.FC<{ playing: boolean }> = ({ playing }) => {
  const steps = [
    { label: 'try block executes', color: 'bg-blue-700', delay: 0 },
    { label: '⚡ Exception thrown!', color: 'bg-red-700', delay: 0.5 },
    { label: 'Stack unwinds…', color: 'bg-orange-700', delay: 1.0 },
    { label: 'catch block matches', color: 'bg-green-700', delay: 1.5 },
    { label: 'finally always runs', color: 'bg-gray-600', delay: 2.0 },
  ];

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={playing ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: s.delay, duration: 0.35 }}
            className={`${s.color} text-white text-xs px-6 py-2 rounded-md font-mono min-w-[200px] text-center`}
          >
            {s.label}
          </motion.div>
          {i < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={playing ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: s.delay + 0.2 }}
              className="text-gray-500"
            >
              ↓
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Code Demo (highlighted)
───────────────────────────────────────── */
const CodeDemo: React.FC<{ playing: boolean }> = ({ playing }) => {
  const lines = [
    'class BankAccount {',
    '  private double balance;',
    '',
    '  public void deposit(double amount) {',
    '    if (amount > 0) balance += amount;',
    '  }',
    '',
    '  public double getBalance() {',
    '    return balance;',
    '  }',
    '}',
  ];

  return (
    <div className="bg-[#1e1e1e] rounded-xl p-4 font-mono text-xs leading-6 min-w-[260px]">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={playing ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: i * 0.08, duration: 0.2 }}
          className="text-gray-300"
        >
          <span className="text-gray-600 mr-3 select-none">{String(i + 1).padStart(2, ' ')}</span>
          {line.includes('private') ? (
            <span>
              {'  '}<span className="text-blue-400">private</span>{' double balance;'}
            </span>
          ) : line.includes('public') ? (
            <span className="text-cyan-400">{line}</span>
          ) : (
            line
          )}
        </motion.div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────
   Main ConceptVisualizer
───────────────────────────────────────── */
const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({ visualType, title }) => {
  const [playing, setPlaying] = useState(false);
  const [key, setKey] = useState(0);

  const handlePlay = () => {
    setKey(k => k + 1);
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setKey(k => k + 1);
  };

  const renderVisual = () => {
    const props = { playing, key };
    switch (visualType) {
      case 'memory-model': return <MemoryModel {...props} />;
      case 'flow': return <FlowChart {...props} />;
      case 'stack-frame': return <StackFrameVisual {...props} />;
      case 'class-hierarchy': return <ClassHierarchy {...props} />;
      case 'hash-map': return <HashMapVisual {...props} />;
      case 'linked-list': return <LinkedListVisual {...props} />;
      case 'array-resize': return <ArrayResizeVisual {...props} />;
      case 'stream-pipeline': return <StreamPipeline {...props} />;
      case 'exception-flow': return <ExceptionFlow {...props} />;
      case 'code-demo': return <CodeDemo {...props} />;
      default: return null;
    }
  };

  return (
    <div className="bg-gray-900/60 dark:bg-black/30 border border-white/10 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Visual: {visualType.replace(/-/g, ' ')}
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-white p-1 rounded transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue text-xs px-3 py-1.5 rounded-lg transition-colors border border-neon-blue/20"
          >
            <Play className="w-3 h-3" />
            {playing ? 'Replay' : 'Play'}
          </button>
        </div>
      </div>

      {/* Animation area */}
      <div className="min-h-[200px] flex items-center justify-center px-4 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!playing ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-4xl mb-3">🎬</div>
              <p className="text-gray-500 text-sm">Press Play to animate the concept</p>
            </motion.div>
          ) : (
            <motion.div key={`visual-${key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              {renderVisual()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConceptVisualizer;
