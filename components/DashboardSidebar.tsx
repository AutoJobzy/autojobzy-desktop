
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Settings,
  FileText,
  CreditCard,
  LogOut,
  Cpu,
  BarChart3,
  User,
  RefreshCw,
  Lightbulb,
  UserCog,
  ChevronDown,
  ChevronUp,
  Activity,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { logout } = useApp();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [profileExpanded, setProfileExpanded] = useState<boolean>(false);

  // Fetch user info from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        setUserName(fullName || 'User');
        setUserEmail(user.email || '');
        setUserRole(user.role || '');
      } catch (e) {
        setUserName('User');
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Analytics hidden for regular users
  const showAnalyticsTab = false;

  const menuItems = [
    { id: 'overview', label: 'Job Engine', icon: LayoutDashboard },
    ...(showAnalyticsTab ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
    { id: 'activity', label: 'My Activity', icon: Activity },
    { id: 'config', label: 'Job Profile', icon: Settings },
    { id: 'auto-profile-update', label: 'Auto Profile Update', icon: RefreshCw },
    { id: 'history', label: 'Application History', icon: FileText },
  ];

  // Build profile menu items dynamically based on user role
  const profileMenuItems = [
    { id: 'billing', label: 'My Plan', icon: CreditCard },
    { id: 'suggest-earn', label: 'Suggest & Earn', icon: Lightbulb },
    { id: 'settings', label: 'App Settings', icon: UserCog },
    ...(userRole === 'institute_admin' ? [{ id: 'institute-admin', label: 'Institute Admin Panel', icon: Building2, isNavigation: true }] : []),
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  return (
    <div className="w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-white/10 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex shadow-sm">
      <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-white/10">
        <Cpu className="h-6 w-6 text-neon-blue animate-pulse mr-2" />
        <span className="font-heading font-bold text-xl text-gray-900 dark:text-white">
          Auto<span className="text-neon-blue">Jobzy</span>
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === item.id
              ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-neon-blue' : 'text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-white/10 space-y-3">
        {/* Profile Dropdown Menu - Appears Above Profile Button */}
        {profileExpanded && (
          <div className="space-y-1 pl-2 pb-2 border-b border-gray-200 dark:border-white/10">
            {profileMenuItems.map((item: any) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'logout') {
                    handleLogout();
                  } else if (item.isNavigation) {
                    // Navigate to external page (like Institute Admin Panel)
                    navigate(`/${item.id}`);
                  } else {
                    setActiveTab(item.id);
                  }
                  setProfileExpanded(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${activeTab === item.id
                  ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'
                  : item.id === 'logout'
                    ? 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400'
                    : item.id === 'institute-admin'
                      ? 'text-gray-600 dark:text-gray-400 hover:bg-neon-purple/10 hover:text-neon-purple dark:hover:text-neon-purple'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-neon-blue' : item.id === 'logout' ? 'text-gray-500 hover:text-red-600 dark:hover:text-red-400' : item.id === 'institute-admin' ? 'text-neon-purple' : 'text-gray-500'}`} />
                <span className="font-medium text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* User Profile Section - Clickable */}
        <button
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-gray-900 dark:text-white font-medium text-sm truncate">{userName}</div>
            {userEmail && (
              <div className="text-gray-500 text-xs truncate">{userEmail}</div>
            )}
          </div>
          {profileExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white flex-shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;