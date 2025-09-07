import { useState } from 'react';
import Home from './Home/Home';
import GameSchedule from './GameSchedule/GameSchedule';
import ThreadCalculator from './ThreadCalculator/ThreadCalculator';
import AnimatedButton from './components/AnimatedButton/AnimatedButton';
import { FaHome } from 'react-icons/fa';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import translations from './Translation/Translations';
import './App.scss';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const { language } = useLanguage();

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
