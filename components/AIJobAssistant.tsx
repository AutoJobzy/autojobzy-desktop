import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  name: string;
  yearsOfExperience?: string;
  location?: string;
  currentCTC?: string;
  expectedCTC?: string;
  noticePeriod?: string;
}

const STARTER_QUESTIONS = [
  'How can I improve my resume headline?',
  'What skills should I add for a software engineer role?',
  'How do I answer "Why should we hire you?"',
  'Review my job search strategy',
];

function buildSystemPrompt(profile: UserProfile): string {
  const lines = [
    'You are an expert AI job search assistant for AutoJobzy, helping Indian job seekers land their dream job.',
    `You are currently assisting: ${profile.name}.`,
    '',
    'User profile:',
  ];
  if (profile.yearsOfExperience) lines.push(`- Experience: ${profile.yearsOfExperience} years`);
  if (profile.location) lines.push(`- Location: ${profile.location}`);
  if (profile.currentCTC) lines.push(`- Current CTC: ${profile.currentCTC}`);
  if (profile.expectedCTC) lines.push(`- Expected CTC: ${profile.expectedCTC}`);
  if (profile.noticePeriod) lines.push(`- Notice period: ${profile.noticePeriod}`);
  lines.push('');
  lines.push(
    'Give practical, concise, personalized advice. Use profile data to tailor your answers. ' +
    'Keep responses focused and actionable. Use simple language suitable for Indian job seekers.'
  );
  return lines.join('\n');
}

const AIJobAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an expert AI job search assistant helping Indian job seekers land their dream job. Give practical, concise, and actionable advice.'
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function loadProfile() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User' : 'User';

      const res = await fetch(`${API_BASE_URL}/job-settings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      const s = data.settings || data;

      const p: UserProfile = {
        name,
        yearsOfExperience: s.yearsOfExperience || s.experience || '',
        location: s.location || s.preferredLocation || '',
        currentCTC: s.currentCTC || s.currentSalary || '',
        expectedCTC: s.expectedCTC || s.expectedSalary || '',
        noticePeriod: s.noticePeriod || '',
      };

      setProfile(p);
      setSystemPrompt(buildSystemPrompt(p));
    } catch {
      // Use generic prompt if profile load fails
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: trimmed,
          systemPrompt,
          history: messages,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply || 'No response received.' }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: 'assistant', content: `❌ ${error.message || 'Something went wrong. Please try again.'}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }

  const firstName = profile?.name?.split(' ')[0] || '';

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)', minHeight: '500px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/20 to-blue-600/20 border border-neon-blue/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-neon-blue" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Job Assistant</h2>
          <p className="text-gray-400 text-sm">
            {firstName
              ? `Personalized for ${firstName} · Ask me anything about your job search`
              : 'Ask me anything about your job search'}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto bg-gray-950 border border-gray-800 rounded-xl p-4 mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6 py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/10 to-blue-600/10 border border-neon-blue/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-neon-blue" />
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-base font-medium mb-1">
                {firstName ? `Hey ${firstName}! 👋` : 'Hey there! 👋'}
              </p>
              <p className="text-gray-500 text-sm">Tap a question below or type your own</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-left px-4 py-3 bg-gray-900 border border-gray-700 hover:border-neon-blue/40 hover:bg-gray-800 text-gray-300 hover:text-white text-xs rounded-lg transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-neon-blue to-blue-600'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-gray-300" />
                  }
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'bg-neon-blue/10 border border-neon-blue/20 text-white'
                    : 'bg-gray-800 border border-gray-700 text-gray-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-gray-300" />
                </div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-gray-400 text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <textarea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about resume tips, interview prep, job strategy..."
          rows={2}
          disabled={loading}
          className="flex-1 bg-gray-900 border border-gray-700 focus:border-neon-blue/50 focus:outline-none text-white placeholder-gray-500 text-sm px-4 py-3 rounded-xl resize-none transition-colors disabled:opacity-60"
        />
        <button
          onClick={() => sendMessage(inputText)}
          disabled={loading || !inputText.trim()}
          className="px-4 bg-neon-blue/10 hover:bg-neon-blue/20 disabled:opacity-40 disabled:cursor-not-allowed border border-neon-blue/30 text-neon-blue rounded-xl transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
      <p className="text-gray-600 text-xs mt-2 text-center flex-shrink-0">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};

export default AIJobAssistant;
