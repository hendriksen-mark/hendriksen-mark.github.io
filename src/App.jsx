import { useState, useEffect } from 'react';
import Home from './Home/Home';
import GameSchedule from './GameSchedule/GameSchedule';
import ThreadCalculator from './ThreadCalculator/ThreadCalculator';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import './App.scss';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');

  // Shared function definitions with colors (only for pages with cards)
  const functions = [
    { id: 'game-schedule', view: 'game-schedule' },
    { id: 'thread-calculator', view: 'thread-calculator' }
  ];

  // Generate color using HSL - matches Home component logic exactly
  const getViewColor = (viewId, isDark = false) => {
    // Use the same mapping as Home.jsx to get consistent colors
    const viewToIndex = {
      'game-schedule': 0,        // Index 0 in Home.jsx functions array
      'thread-calculator': 1     // Index 1 in Home.jsx functions array  
    };
    
    const funcIndex = viewToIndex[viewId];
    if (funcIndex === undefined) return null;
    
    // Use 11 as total count to match Home.jsx functions array length
    const totalFunctions = 11;
    const hue = (360 / totalFunctions) * funcIndex;
    const saturation = isDark ? 60 : 79; // Slightly less saturated in dark mode
    const lightness = isDark ? 25 : 43; // Darker in dark mode
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Set html/body background based on currentView and color scheme
  useEffect(() => {
    const setBg = () => {
      // Only apply dynamic background for pages with cards, not home
      if (currentView === 'home') {
        // Reset to default for home page (let Home.scss handle it)
        document.documentElement.style.background = '';
        document.body.style.background = '';
        return;
      }
      
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const color1 = getViewColor(currentView, dark);
      
      if (color1) {
        // Create gradient with slightly different hue for the second color
        const viewToIndex = {
          'game-schedule': 0,
          'thread-calculator': 1
        };
        const funcIndex = viewToIndex[currentView];
        const totalFunctions = 11;
        const hue2 = ((360 / totalFunctions) * funcIndex + 30) % 360;
        const saturation = dark ? 60 : 79;
        const lightness = dark ? 20 : 38; // Slightly darker for gradient
        const color2Modified = `hsl(${hue2}, ${saturation}%, ${lightness}%)`;
        
        const bg = `linear-gradient(135deg, ${color1} 0%, ${color2Modified} 100%)`;
        document.documentElement.style.background = bg;
        document.body.style.background = bg;
      }
    };
    
    setBg();
    // Listen for color scheme changes
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', setBg);
    return () => mq.removeEventListener('change', setBg);
  }, [currentView]);

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
