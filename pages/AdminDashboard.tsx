import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, BarChart, Users, CreditCard, LogOut, DollarSign } from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPlans from './AdminPlans';
import AdminMoneyManagement from './AdminMoneyManagement';

type TabType = 'overview' | 'users' | 'plans' | 'money';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const navigate = useNavigate();

  const tabs = [
    { id: 'overview' as TabType, label: 'Dashboard', icon: BarChart },
    { id: 'users' as TabType, label: 'User Management', icon: Users },
    { id: 'plans' as TabType, label: 'Plan Management', icon: CreditCard },
    { id: 'money' as TabType, label: 'Money Management', icon: DollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Top Bar */}
      <div className="bg-dark-800 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-gray-400">AutoJobzy Platform</p>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white font-medium">{adminUser.email}</p>
                <p className="text-xs text-gray-400">Administrator</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'overview' && <AdminOverview />}
        {activeTab === 'users' && <AdminUsers />}
        {activeTab === 'plans' && <AdminPlans />}
        {activeTab === 'money' && <AdminMoneyManagement />}
      </div>
    </div>
  );
};

export default AdminDashboard;
