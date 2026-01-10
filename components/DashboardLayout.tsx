
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
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center px-4 z-50 justify-between shadow-sm">
        <span className="font-heading font-bold text-lg text-gray-900">AutoJobzy</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-900">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white z-40 border-b border-gray-200 p-4 space-y-2 shadow-lg">
          <button onClick={() => { setActiveTab('overview'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'overview' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>Job Engine</button>
          {/* Analytics hidden */}
          {false && <button onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'analytics' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>Analytics</button>}
          <button onClick={() => { setActiveTab('activity'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'activity' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>My Activity</button>
          <button onClick={() => { setActiveTab('config'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'config' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>Job Profile</button>
          <button onClick={() => { setActiveTab('auto-profile-update'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'auto-profile-update' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>Auto Profile Update</button>
          <button onClick={() => { setActiveTab('history'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'history' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>History</button>

          {/* Profile Menu Items */}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <button onClick={() => { setActiveTab('billing'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'billing' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>My Plan</button>
            <button onClick={() => { setActiveTab('suggest-earn'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'suggest-earn' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>Suggest & Earn</button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }} className={`block w-full text-left px-4 py-2 text-gray-900 rounded ${activeTab === 'settings' ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'hover:bg-gray-100'}`}>App Settings</button>
            <button onClick={() => { setActiveTab('logout'); setMobileMenuOpen(false) }} className="block w-full text-left px-4 py-2 text-red-600 rounded hover:bg-red-50">Logout</button>
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen bg-gray-50">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
