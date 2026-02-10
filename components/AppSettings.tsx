import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Moon, Monitor, Check, Settings as SettingsIcon } from 'lucide-react';

const AppSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: 'dark' as const,
      label: 'Dark Mode',
      icon: Moon,
      description: 'Easy on the eyes',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/10 dark:to-purple-500/10 border border-blue-500/20 dark:border-blue-500/20 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">App Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Customize your experience and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Theme Settings Section */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-500" />
            Appearance
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose how the app looks on your device
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Theme Mode
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-lg shadow-blue-500/20'
                      : 'border-gray-200 dark:border-white/10 bg-white dark:bg-dark-900 hover:border-blue-300 dark:hover:border-blue-500/50'
                  }`}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-1 ${
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                  }`}>
                    {option.label}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Theme applied instantly
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Your theme preference is saved automatically and will be remembered across sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Settings Sections (Placeholders for future features) */}
      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Notifications</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your notification preferences
          </p>
        </div>

        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-900 rounded-full mb-3">
            <SettingsIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Coming Soon</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 rounded-lg p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Privacy & Security</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your privacy and security settings
          </p>
        </div>

        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-dark-900 rounded-full mb-3">
            <SettingsIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
