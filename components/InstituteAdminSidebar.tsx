import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
  LogOut,
  User,
} from 'lucide-react';

interface InstituteAdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  instituteName: string;
  adminEmail?: string;
}

const InstituteAdminSidebar: React.FC<InstituteAdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  instituteName,
  adminEmail,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('instituteAdminToken');
    localStorage.removeItem('instituteAdminUser');
    navigate('/institute-admin/login');
  };

  const menuItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: Users,
    },
    {
      id: 'subscription',
      label: 'Subscription',
      icon: CreditCard,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="w-64 bg-dark-800 border-r border-white/10 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo/Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{instituteName}</h2>
            <p className="text-xs text-gray-400">Institute Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-[0_0_20px_rgba(0,243,255,0.3)]'
                  : 'text-gray-400 hover:text-white hover:bg-dark-900/50'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Profile Section at Bottom */}
      <div className="p-4 border-t border-white/10">
        <div className="bg-dark-900/50 rounded-lg p-4 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-neon-blue to-neon-purple rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              {adminEmail && (
                <p className="text-xs text-gray-400 truncate">{adminEmail}</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default InstituteAdminSidebar;
