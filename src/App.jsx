import { useState } from 'react';
import Home from './Home/Home';
import GameSchedule from './GameSchedule/GameSchedule';
import ThreadCalculator from './ThreadCalculator/ThreadCalculator';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import './App.scss';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'game-schedule':
        return <GameSchedule onBackToHome={handleBackToHome} />;
      case 'thread-calculator':
        return <ThreadCalculator onBackToHome={handleBackToHome} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      <Toaster position="top-right" />
      <main className="app__main">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
