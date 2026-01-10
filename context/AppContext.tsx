
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, PricingPlan, JobConfig, LogEntry, JobReport } from '../types';
import { PRICING_PLANS } from '../constants';
import * as XLSX from 'xlsx';
import { completeOnboarding as completeOnboardingApi } from '../services/automationApi';

interface AppContextType {
  user: User;
  logs: LogEntry[];
  reports: JobReport[];
  isAutomating: boolean;
  login: (username: string, email: string, onboardingCompleted?: boolean) => void;
  logout: () => void;
  selectPlan: (planId: string) => void;
  updateConfig: (config: JobConfig) => void;
  startAutomation: () => void;
  stopAutomation: () => void;
  scheduleAutomation: (time: string) => void;
  downloadReport: () => void;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USER: User = {
  username: '',
  email: '',
  isLoggedIn: false,
  onboardingCompleted: false,
};

// Helper to get persisted user from localStorage
const getPersistedUser = (): User => {
  try {
    // First check for autojobzy_user (old format)
    const stored = localStorage.getItem('autojobzy_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...INITIAL_USER, ...parsed };
    }

    // Also check for 'user' and 'token' (backend API format)
    const backendUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (backendUser && token) {
      const userData = JSON.parse(backendUser);
      return {
        username: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        email: userData.email || '',
        isLoggedIn: true,
        onboardingCompleted: userData.onboardingCompleted ?? false,
      };
    }
  } catch (e) {
    console.error('Failed to parse stored user:', e);
  }
  return INITIAL_USER;
};

// Mock Backend Logic
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(getPersistedUser);
  const [isAutomating, setIsAutomating] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [reports, setReports] = useState<JobReport[]>([]);

  // Persist user state to localStorage whenever it changes
  useEffect(() => {
    if (user.isLoggedIn) {
      localStorage.setItem('autojobzy_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('autojobzy_user');
    }
  }, [user]);

  // Simulation Interval Ref
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setInterval> | null>(null);

  // Helper functions defined first
  const addLog = useCallback((text: string, color: string = 'text-gray-300') => {
    setLogs(prev => [...prev.slice(-99), { // Keep last 100 logs
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      text,
      color
    }]);
  }, []);

  const stopAutomation = useCallback(() => {
    setIntervalId(prevId => {
      if (prevId) clearInterval(prevId);
      return null;
    });
    setIsAutomating(false);
    addLog('Automation stopped by user.', 'text-red-400');
  }, [addLog]);

  const login = useCallback((username: string, email: string, onboardingCompleted?: boolean) => {
    // Also sync with the 'user' localStorage that contains backend data
    const backendUser = localStorage.getItem('user');
    let backendOnboardingCompleted = onboardingCompleted;

    if (backendUser && backendOnboardingCompleted === undefined) {
      try {
        const userData = JSON.parse(backendUser);
        backendOnboardingCompleted = userData.onboardingCompleted ?? false;
      } catch (e) {
        backendOnboardingCompleted = false;
      }
    }

    setUser(prev => ({
      ...prev,
      username,
      email,
      isLoggedIn: true,
      onboardingCompleted: backendOnboardingCompleted ?? false
    }));
    addLog(`User ${username} logged in successfully.`, 'text-green-400');
  }, [addLog]);

  const logout = useCallback(() => {
    stopAutomation();
    setUser(INITIAL_USER);
    setLogs([]);
    setReports([]);

    // Clear all authentication tokens and session data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('autojobzy_user');
    localStorage.removeItem('pendingPlanId');
    localStorage.removeItem('selectedPlanId');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('instituteAdminToken');
    localStorage.removeItem('instituteAdminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdminUser');

    // Clear any session storage if used
    sessionStorage.clear();
  }, [stopAutomation]);

  const selectPlan = useCallback((planId: string) => {
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (plan) {
      setUser(prev => ({ ...prev, plan }));
      addLog(`Plan updated to: ${plan.name}`, 'text-neon-blue');
    }
  }, [addLog]);

  const updateConfig = useCallback((config: JobConfig) => {
    setUser(prev => ({ ...prev, config }));
    addLog(`Configuration saved for target: ${config.targetRole}`, 'text-yellow-400');
    if (config.resumeName) {
        addLog(`Resume '${config.resumeName}' analyzed. Score: ${config.resumeScore || 85}/100`, 'text-neon-purple');
    }
  }, [addLog]);

  const addReport = useCallback((title: string, company: string, score: number, status: any) => {
     const newReport: JobReport = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        jobTitle: title,
        company: company,
        matchScore: score,
        status: status,
        platform: 'Naukri'
    };
    setReports(prev => [newReport, ...prev]);
  }, []);

  // The "Puppeteer Script" Simulation
  const runSimulationStep = useCallback(() => {
    const companies = ['TechSol Info', 'InnovateAI Systems', 'DataCorp Global', 'CloudSys', 'Webify Solutions', 'AutoTech Labs', 'SoftServe Inc'];
    const titles = [user.config?.targetRole || 'Software Engineer', 'Senior Developer', 'Full Stack Engineer', 'Backend Developer'];

    const randomCompany = companies[Math.floor(Math.random() * companies.length)];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    // Mimic script loop output
    addLog(`\n-----------------------------`, 'text-gray-500');
    addLog(`➡ Opening job: ${randomTitle} at ${randomCompany}`, 'text-white');

    setTimeout(() => {
        // Match Score Logic
        const matchCheck = Math.floor(Math.random() * 5) + 2; // 2 to 6
        const matchCross = Math.random() > 0.8 ? 1 : 0; // Occasional mismatch

        addLog(`Match Score: { check: ${matchCheck}, cross: ${matchCross} }`, 'text-gray-400');

        if (matchCross === 0 && matchCheck >= 4) {
            addLog("👍 Good match → Eligible to apply", 'text-green-400');

            setTimeout(() => {
                const isExternal = Math.random() > 0.8;
                if (isExternal) {
                    addLog("⛔ External Apply → Skipping...", 'text-red-400');
                    addReport(randomTitle, randomCompany, 85, 'External');
                } else {
                    addLog("✔ Clicking apply…", 'text-neon-blue');

                    // Chatbot Simulation
                    setTimeout(() => {
                        const hasChatbot = Math.random() > 0.5;
                        if (hasChatbot) {
                             addLog(`❓ Question: What is your expected CTC?`, 'text-yellow-200');
                             addLog(`🟢 AI Answer: ${user.config?.expectedSalary || '10 LPA'}`, 'text-green-300');
                             addLog("🎉 Chatbot answers completed!", 'text-purple-400');
                        }

                        addLog("⏳ Waiting 4 seconds...", 'text-gray-500');
                        addReport(randomTitle, randomCompany, 95, 'Applied');
                    }, 1500);
                }
            }, 1000);

        } else {
            addLog("❌ Poor match → Skipping...", 'text-red-400');
            addLog("⏳ Waiting 4 seconds...", 'text-gray-500');
        }
    }, 1500);
  }, [user.config, addLog, addReport]);

  const startAutomation = useCallback(() => {
    if (!user.config) {
      addLog('Error: No configuration found. Please setup profile.', 'text-red-500');
      return;
    }

    setIsAutomating(true);
    // Mimic the exact start sequence of autoApply.js
    addLog('🌐 Opening Naukri Login...', 'text-white');

    setTimeout(() => {
        addLog('🔐 Logging in...', 'text-yellow-400');
        setTimeout(() => {
            addLog(`📄 Opening job page... ${user.config?.targetRole} jobs`, 'text-neon-blue');
            const id = setInterval(() => {
              runSimulationStep();
            }, 6000); // Slower interval to match script pacing
            setIntervalId(id);
        }, 3000);
    }, 2000);
  }, [user.config, addLog, runSimulationStep]);

  const scheduleAutomation = useCallback((time: string) => {
    addLog(`⏰ Automation scheduled for ${time}. Waiting...`, 'text-neon-green');
  }, [addLog]);

  const downloadReport = useCallback(() => {
    // Prepare data for Excel export
    const headers = ['Date', 'Job Title', 'Company', 'Match Score', 'Status'];
    const rows = reports.map(r => [r.date, r.jobTitle, r.company, `${r.matchScore}%`, r.status]);
    const data = [headers, ...rows];

    // Create workbook and worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Reports');

    // Generate Excel file and trigger download
    const fileName = `job_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    addLog('Report downloaded successfully as XLSX.', 'text-neon-blue');
  }, [reports, addLog]);

  const completeOnboarding = useCallback(async () => {
    try {
      // Call API to persist onboarding completion to database
      await completeOnboardingApi();

      // Update local state
      setUser(prev => ({ ...prev, onboardingCompleted: true }));

      // Update localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.onboardingCompleted = true;
        localStorage.setItem('user', JSON.stringify(userData));
      }

      addLog('Welcome! Your onboarding is complete.', 'text-green-400');
    } catch (error) {
      // Even if API fails, update local state so user can proceed
      setUser(prev => ({ ...prev, onboardingCompleted: true }));
      addLog('Welcome! Your onboarding is complete.', 'text-green-400');
    }
  }, [addLog]);

  return (
    <AppContext.Provider value={{
      user,
      logs,
      reports,
      isAutomating,
      login,
      logout,
      selectPlan,
      updateConfig,
      startAutomation,
      stopAutomation,
      scheduleAutomation,
      downloadReport,
      completeOnboarding
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
