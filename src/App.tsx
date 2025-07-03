import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import DataExplorer from './components/DataExplorer';
import Predictions from './components/Predictions';
import PredictionHistory from './components/PredictionHistory';
import Profile from './components/Profile';
import { getCurrentUser, signOut, saveUser } from './utils/auth';
import { getSampleDataset } from './utils/sampleData';
import { AuthState, User } from './types';

function App() {
  const [showHomePage, setShowHomePage] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [activeTab, setActiveTab] = useState('explore');
  const dataset = getSampleDataset(); // Always use complete dataset

  useEffect(() => {
    const user = getCurrentUser();
    setAuthState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
    
    // If user is already authenticated, skip home page
    if (user) {
      setShowHomePage(false);
    }
  }, []);

  const handleGetStarted = () => {
    setShowHomePage(false);
  };

  const handleAuthSuccess = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
    setShowHomePage(false);
  };

  const handleSignOut = () => {
    signOut();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    setShowHomePage(true);
  };

  const handleUpdateUser = (updatedUser: User) => {
    saveUser(updatedUser);
    setAuthState(prev => ({
      ...prev,
      user: updatedUser,
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return <DataExplorer dataset={dataset} />;
      case 'predict':
        return <Predictions user={authState.user} />;
      case 'history':
        return <PredictionHistory user={authState.user} />;
      case 'profile':
        return <Profile user={authState.user} onUpdateUser={handleUpdateUser} />;
      default:
        return <DataExplorer dataset={dataset} />;
    }
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show home page for new visitors
  if (showHomePage) {
    return <HomePage onGetStarted={handleGetStarted} />;
  }

  // Show auth form if not authenticated
  if (!authState.isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={authState.user}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;