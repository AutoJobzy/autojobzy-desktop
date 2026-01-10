import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Crown,
  ChevronDown,
  UserCircle,
  BarChart3,
  User,
} from 'lucide-react';

interface SuperAdminSidebarProps {
  children?: React.ReactNode;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/superadmin/dashboard',
      description: 'Overview & Statistics',
    },
    {
      icon: Building2,
      label: 'Institutes',
      path: '/superadmin/institutes',
      description: 'Manage Institutes',
    },
    {
      icon: Package,
      label: 'Packages',
      path: '/superadmin/packages',
      description: 'Subscription Plans',
    },
    {
      icon: User,
      label: 'Individual Users',
      path: '/superadmin/individual-users',
      description: 'Users with Subscriptions',
    },
    {
      icon: Users,
      label: 'All Users',
      path: '/superadmin/users',
      description: 'Complete User List',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      navigate('/superadmin/login');
    }
  };

  const superAdminUser = JSON.parse(localStorage.getItem('superAdminUser') || '{}');

  return (
    <div className="flex h-screen bg-dark-900">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 bg-dark-800 border-r border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Super Admin</h2>
              <p className="text-gray-400 text-xs">Master Control Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    active
                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                      : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                  <div className="flex-1 text-left">
                    <p className={`font-medium ${active ? 'text-white' : ''}`}>{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                  {active && (
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-medium text-sm">
                {superAdminUser.firstName} {superAdminUser.lastName}
              </p>
              <p className="text-gray-500 text-xs">{superAdminUser.email}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="mt-2 space-y-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-3 bg-dark-800 border border-white/10 rounded-lg text-white"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-dark-800 border-r border-white/10" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Super Admin</h2>
                  <p className="text-gray-400 text-xs">Master Control Panel</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 overflow-y-auto h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        active
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-white'
                          : 'text-gray-400 hover:bg-dark-700 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? 'text-purple-400' : ''}`} />
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${active ? 'text-white' : ''}`}>{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* User Menu */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SuperAdminSidebar;
