
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
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-40 hidden md:flex shadow-lg">
      <div className="h-20 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-purple-500">
        <Cpu className="h-6 w-6 text-white animate-pulse mr-2" />
        <span className="font-heading font-bold text-xl text-white">
          Auto<span className="text-white font-extrabold">Jobzy</span>
        </span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 bg-gray-50">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${activeTab === item.id
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-gray-700 hover:bg-white hover:shadow-sm'
              }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-gray-500 group-hover:text-primary-500'}`} />
            <span className="font-medium text-sm">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-2 h-2 rounded-full bg-white"></div>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white space-y-3">
        {/* Profile Dropdown Menu - Appears Above Profile Button */}
        {profileExpanded && (
          <div className="space-y-1 pl-2 pb-2 border-b border-gray-200">
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
                  ? 'bg-primary-50 text-primary-700 border border-primary-200'
                  : item.id === 'logout'
                    ? 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                    : item.id === 'institute-admin'
                      ? 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <item.icon className={`w-4 h-4 ${activeTab === item.id ? 'text-primary-600' : item.id === 'logout' ? 'text-gray-500 hover:text-red-600' : item.id === 'institute-admin' ? 'text-purple-500' : 'text-gray-500'}`} />
                <span className="font-medium text-xs">{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* User Profile Section - Clickable */}
        <button
          onClick={() => setProfileExpanded(!profileExpanded)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-gray-900 font-medium text-sm truncate">{userName}</div>
            {userEmail && (
              <div className="text-gray-500 text-xs truncate">{userEmail}</div>
            )}
          </div>
          {profileExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-600 group-hover:text-gray-900 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600 group-hover:text-gray-900 flex-shrink-0" />
          )}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;