
import React from 'react';
import DashboardSidebar from './DashboardSidebar';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-900 border-b border-gray-200 dark:border-white/10 flex items-center px-4 z-50 justify-between shadow-sm">
        <span className="font-heading font-bold text-lg text-gray-900 dark:text-white">AutoJobzy</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900 dark:text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-gray-50 dark:bg-dark-800 z-40 border-b border-gray-200 dark:border-white/10 p-4 space-y-2 shadow-lg">
          <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'overview' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>Job Engine</button>
          {/* Analytics hidden */}
          {false && <button onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'analytics' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>Analytics</button>}
          <button onClick={() => { setActiveTab('activity'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'activity' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>My Activity</button>
          <button onClick={() => { setActiveTab('config'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'config' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>Job Profile</button>
          <button onClick={() => { setActiveTab('auto-profile-update'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'auto-profile-update' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>Auto Profile Update</button>
          <button onClick={() => { setActiveTab('history'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'history' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>History</button>

          {/* Profile Menu Items */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-2 mt-2">
            <button onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'billing' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>My Plan</button>
            <button onClick={() => { setActiveTab('suggest-earn'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'suggest-earn' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>Suggest & Earn</button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 dark:text-white rounded ${activeTab === 'settings' ? 'bg-neon-blue/10 border border-neon-blue/20' : 'hover:bg-gray-100 dark:hover:bg-white/5'}`}>App Settings</button>
            <button onClick={() => { setActiveTab('logout'); setMobileMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-500/10">Logout</button>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-gray-50 dark:bg-dark-900">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
