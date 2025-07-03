import React from 'react';
import { 
  BarChart3, 
  Target, 
  User,
  Heart,
  LogOut,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onSignOut }) => {
  const tabs = [
    { id: 'explore', label: 'Data Explorer', icon: BarChart3 },
    { id: 'predict', label: 'Risk Assessment', icon: Target },
    { id: 'history', label: 'My Predictions', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="w-72 bg-white shadow-xl border-r border-gray-100 h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-600 bg-red-600 rounded-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DiabetesAI</h1>
            <p className="text-sm text-gray-500">Health Dashboard</p>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Predictions: {user?.predictions?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;