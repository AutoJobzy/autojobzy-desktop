
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  Play, Square, Download, Activity, Save, User, Key, MapPin, Search, Globe,
  ChevronLeft, ChevronRight, RotateCw, X, UploadCloud, FileText, CheckCircle,
  Clock, IndianRupee, Calendar, Loader2, AlertCircle, Plus, Trash2, Star,
  Filter, Building2, Briefcase, GraduationCap, Home, Zap, Crown, Rocket,
  CreditCard, Check, BarChart3, TrendingUp, TrendingDown, Target, Award,
  Users, Mail, ThumbsUp, ArrowUpRight, Lightbulb, Eye, EyeOff, ExternalLink,
  Settings, LogOut
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import OnboardingFlow from '../components/OnboardingFlow';
import { runBot, stopAutomation, getAutomationLogs, updateJobSettings, getSkills, saveSkillsBulk } from '../services/automationApi';
import { getSubscriptionStatus } from '../services/subscriptionApi';
import { debugLog } from '../utils/platformDetection';

// API Base URL - AWS Backend Server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, logs, isAutomating, startAutomation, stopAutomation: stopAppAutomation, completeOnboarding } = useApp();

  // Automation state
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [botLogs, setBotLogs] = useState<any[]>([]);
  const [appliedCount, setAppliedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  // Data states
  const [analytics, setAnalytics] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [applicationHistory, setApplicationHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Config state
  const [configForm, setConfigForm] = useState(user.config || {
    fullName: '',
    naukriUsername: '',
    naukriPassword: '',
    targetRole: '',
    location: '',
    keywords: 'Software Engineer',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: 'Immediate',
    resumeName: '',
  });

  // Automation module readiness (Electron)
  const [automationModuleReady, setAutomationModuleReady] = useState(false);
  const [automationModuleError, setAutomationModuleError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
    loadJobSettings();
  }, []);

  // Listen for automation logs (Electron)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const electronAPI = (window as any).electronAPI;
      const logListener = electronAPI.onAutomationLog((log: any) => {
        setBotLogs((prevLogs) => [...prevLogs, log]);
      });
      return () => {
        if (logListener) {
          electronAPI.removeAutomationLogListener(logListener);
        }
      };
    }
  }, []);

  // Check automation module readiness (Electron)
  useEffect(() => {
    const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;
    if (!isElectron) {
      setAutomationModuleReady(true);
      return;
    }

    const electronAPI = (window as any).electronAPI;
    const checkReadiness = async () => {
      try {
        const { ready, error } = await electronAPI.isAutomationModuleReady();
        setAutomationModuleReady(ready);
        setAutomationModuleError(error);
      } catch (err: any) {
        console.error('Failed to check automation module readiness:', err);
      }
    };

    checkReadiness();
    const pollInterval = setInterval(checkReadiness, 2000);

    electronAPI.onAutomationModuleReady(() => {
      setAutomationModuleReady(true);
      setAutomationModuleError(null);
    });

    electronAPI.onAutomationModuleError((error: string) => {
      setAutomationModuleReady(false);
      setAutomationModuleError(error);
    });

    return () => clearInterval(pollInterval);
  }, []);

  // Load all dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch analytics
      await fetchAnalytics();
      // Fetch subscription
      await fetchSubscription();
      // Fetch application history
      await fetchApplicationHistory();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  const fetchSubscription = async () => {
    try {
      const result = await getSubscriptionStatus();
      if (result.success && result.data?.hasActiveSubscription) {
        setSubscription(result.data.subscription);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const fetchApplicationHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/job-results?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setApplicationHistory(result.results || []);
      }
    } catch (err) {
      console.error('Error fetching application history:', err);
    }
  };

  const loadJobSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/job-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setConfigForm({
          fullName: result.fullName || '',
          naukriUsername: result.naukriEmail || '',
          naukriPassword: result.naukriPassword || '',
          targetRole: result.targetRole || '',
          location: result.location || '',
          keywords: result.searchKeywords || '',
          currentSalary: result.currentCTC || '',
          expectedSalary: result.expectedCTC || '',
          noticePeriod: result.noticePeriod || 'Immediate',
          resumeName: result.resumeFileName || '',
        });
      }
    } catch (err) {
      console.error('Error loading job settings:', err);
    }
  };

  const handleStartBot = async () => {
    if (!automationModuleReady) {
      setError('Automation module is not ready yet. Please wait...');
      return;
    }

    setIsRunning(true);
    setError(null);
    setBotLogs([]);
    setAppliedCount(0);
    setSkippedCount(0);

    try {
      const result = await runBot({
        keywords: configForm.keywords,
        maxPages: 5,
        token: localStorage.getItem('token') || '',
      });

      if (result.success) {
        setSuccess(`✅ Automation completed! Applied to ${result.data?.appliedCount || 0} jobs.`);
        setAppliedCount(result.data?.appliedCount || 0);
        setSkippedCount(result.data?.skippedCount || 0);
        loadDashboardData(); // Refresh data
      } else {
        setError(result.error || 'Automation failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during automation');
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopBot = async () => {
    try {
      await stopAutomation();
      setIsRunning(false);
      setSuccess('Automation stopped');
    } catch (err: any) {
      setError('Failed to stop automation');
    }
  };

  // Calculate derived data
  const totalApplications = analytics?.totalApplications || 0;
  const todayApplications = analytics?.todayApplications || 0;
  const successRate = analytics?.successRate || 0;
  const activeJobs = appliedCount;

  // Calculate growth percentage (mock for now)
  const weeklyGrowth = 12;

  // Chart data
  const dailyTrendsData = analytics?.dailyTrends || [
    { date: 'Mon', applications: 5 },
    { date: 'Tue', applications: 8 },
    { date: 'Wed', applications: 12 },
    { date: 'Thu', applications: 7 },
    { date: 'Fri', applications: 15 },
    { date: 'Sat', applications: 10 },
    { date: 'Sun', applications: 6 },
  ];

  const successMetricsData = [
    { name: 'Applied', count: appliedCount || 45, fill: '#10b981' },
    { name: 'Skipped', count: skippedCount || 12, fill: '#f59e0b' },
    { name: 'Pending', count: 8, fill: '#3b82f6' },
  ];

  const matchScoreData = [
    { name: 'High (80-100%)', value: 35, fill: '#10b981' },
    { name: 'Medium (50-79%)', value: 50, fill: '#f59e0b' },
    { name: 'Low (0-49%)', value: 15, fill: '#ef4444' },
  ];

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Navigate to settings
  const handleNavigateToSettings = () => {
    navigate('/dashboard?tab=config');
  };

  return (
    <>
      {!user.onboardingCompleted && (
        <OnboardingFlow onComplete={completeOnboarding} />
      )}

      <DashboardLayout activeTab="overview" setActiveTab={() => { }}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-md border-b border-white/10 px-6 py-6 mb-8"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Welcome back, {user.firstName || 'User'}! 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your job search today</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleNavigateToSettings}
                  className="p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5 text-gray-300" />
                </button>
                <button
                  onClick={logout}
                  className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="max-w-7xl mx-auto px-6 pb-12 space-y-8">
            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <p className="text-green-300">{success}</p>
                <button onClick={() => setSuccess(null)} className="ml-auto">
                  <X className="w-4 h-4 text-green-400" />
                </button>
              </motion.div>
            )}

            {/* Section 1: Analytics & Stats */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white mb-6">Analytics & Performance</h2>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Card 1: Total Applications */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Total Applications</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{totalApplications}</h3>
                        <p className="text-white/60 text-xs mt-1">+{weeklyGrowth}% from last week</p>
                      </div>
                      <TrendingUp className="w-12 h-12 text-white/40" />
                    </div>
                  </motion.div>

                  {/* Card 2: Today's Applications */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-teal-600 p-6 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Today's Applications</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{todayApplications}</h3>
                        <p className="text-white/60 text-xs mt-1">Applied today</p>
                      </div>
                      <Calendar className="w-12 h-12 text-white/40" />
                    </div>
                  </motion.div>

                  {/* Card 3: Success Rate */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Success Rate</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{successRate}%</h3>
                        <p className="text-white/60 text-xs mt-1">Match accuracy</p>
                      </div>
                      <Target className="w-12 h-12 text-white/40" />
                    </div>
                  </motion.div>

                  {/* Card 4: Active Jobs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 p-6 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Active Jobs</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{activeJobs}</h3>
                        <p className="text-white/60 text-xs mt-1">In process</p>
                      </div>
                      <Briefcase className="w-12 h-12 text-white/40" />
                    </div>
                  </motion.div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Line Chart: Application Trends */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">Application Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailyTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="applications"
                          stroke="#00f3ff"
                          strokeWidth={3}
                          dot={{ fill: '#00f3ff', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Bar Chart: Success Metrics */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-white/10"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">Application Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={successMetricsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {successMetricsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>

                {/* Pie Chart: Match Score Distribution */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-white/10"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Match Score Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={matchScoreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {matchScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>
            </section>

            {/* Section 2: Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Engine Card */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 p-8 shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-600/10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Zap className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Job Engine</h3>
                        <p className="text-sm text-gray-400">Automate your job applications</p>
                      </div>
                    </div>

                    {isRunning ? (
                      <button
                        onClick={handleStopBot}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                      >
                        <Square className="w-5 h-5" />
                        Stop Automation
                      </button>
                    ) : automationModuleReady ? (
                      <button
                        onClick={handleStartBot}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 animate-pulse"
                      >
                        <Play className="w-5 h-5" />
                        Start Job Engine
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full bg-gray-700 text-gray-400 font-semibold py-4 px-6 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loading Module...
                      </button>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-300">
                      <span>Last run: {botLogs.length > 0 ? 'Just now' : 'Never'}</span>
                      <span className={isRunning ? 'text-green-400' : 'text-gray-400'}>
                        ● {isRunning ? 'Running' : 'Idle'}
                      </span>
                    </div>

                    {appliedCount > 0 && (
                      <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-sm text-green-300">
                          ✓ Last session: Applied to {appliedCount} jobs
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Profile Update Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 p-8 shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-600/10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg">
                        <User className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Profile</h3>
                        <p className="text-sm text-gray-400">Manage your job profile</p>
                      </div>
                    </div>

                    <button
                      onClick={handleNavigateToSettings}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
                    >
                      <Settings className="w-5 h-5" />
                      Update Profile
                    </button>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                        <span>Profile Completion</span>
                        <span className="font-semibold">85%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Resume uploaded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-400" />
                        <span>Skills added</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span>Add more preferences</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Section 3: Recent Activity */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-white/10"
              >
                {applicationHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No recent activity</p>
                    <p className="text-sm text-gray-500 mt-2">Start the job engine to see your applications here</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {applicationHistory.slice(0, 10).map((app, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${app.applicationStatus === 'Applied' ? 'bg-green-400' : 'bg-gray-500'
                            }`} />
                          {index < applicationHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-600 mt-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className="text-white font-semibold truncate">
                                {app.jobTitle || 'Job Title'}
                              </h4>
                              <p className="text-sm text-gray-400">
                                {app.companyName || 'Company'} • {app.location || 'Location'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${app.matchScore >= 80
                                ? 'bg-green-500/20 text-green-300'
                                : app.matchScore >= 50
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-red-500/20 text-red-300'
                                }`}>
                                {app.matchScore}% match
                              </span>
                              <span className="text-xs text-gray-500">
                                {getRelativeTime(app.datetime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </section>

            {/* Section 4: Subscription Info */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Subscription</h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {subscription ? (
                  <div className="bg-gradient-to-br from-gray-800/50 to-purple-900/20 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="text-sm text-purple-400 font-bold uppercase mb-1">Current Plan</div>
                        <h3 className="text-3xl font-bold text-white">{subscription.planName}</h3>
                      </div>
                      <div className="bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/20 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-green-400 font-mono font-bold">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Start Date</div>
                        <div className="text-white font-medium">
                          {new Date(subscription.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Expires On</div>
                        <div className="text-white font-medium">
                          {new Date(subscription.endDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs uppercase mb-1">Days Remaining</div>
                        <div className="text-purple-400 font-bold text-xl">
                          {subscription.daysRemaining} days
                        </div>
                      </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                          <span>Applications Used</span>
                          <span className="font-semibold">{totalApplications}/1000</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${(totalApplications / 1000) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                          <span>Days Used</span>
                          <span className="font-semibold">
                            {30 - (subscription.daysRemaining || 30)}/30
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full transition-all"
                            style={{ width: `${((30 - (subscription.daysRemaining || 30)) / 30) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                    <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Active Subscription</h3>
                    <p className="text-gray-400 mb-6">
                      Subscribe to a plan to unlock unlimited job applications
                    </p>
                    <button
                      onClick={() => navigate('/dashboard?tab=billing')}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform shadow-lg"
                    >
                      View Plans
                    </button>
                  </div>
                )}
              </motion.div>
            </section>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
