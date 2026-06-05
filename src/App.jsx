import { useState, useEffect } from 'react';
import Home from './Home/Home';
import GameSchedule from './GameSchedule/GameSchedule';
import ThreadCalculator from './ThreadCalculator/ThreadCalculator';
import ResistorCalculator from './ResistorCalculator/ResistorCalculator';
import SteinhartHartCalculator from './SteinhartHartCalculator/SteinhartHartCalculator';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { getViewColor, getViewGradientColors } from './utils/colorCalculator';
import { VIEW_TO_INDEX, TOTAL_FUNCTIONS } from './config/functionCards';
import './App.scss';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');

  // Set html/body background based on currentView and color scheme
  useEffect(() => {
    const setBg = () => {
      // Only apply dynamic background for pages with cards, not home
      if (currentView === 'home') {
        // Reset to default for home page (let Home.scss handle it)
        document.documentElement.style.background = '';
        document.body.style.background = '';
        document.documentElement.style.setProperty('--select-primary-color', 'white');
        return;
      }

      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const color1 = getViewColor(currentView, dark);

      if (color1) {
        const gradientColors = getViewGradientColors(currentView, dark);
        const color2Modified = gradientColors.color2;

        const bg = `linear-gradient(135deg, ${color1} 0%, ${color2Modified} 100%)`;
        document.documentElement.style.background = bg;
        document.body.style.background = bg;
        
        const funcIndex = VIEW_TO_INDEX[currentView];
        if (funcIndex !== undefined) {
          const hue = (360 / TOTAL_FUNCTIONS) * funcIndex;
          const saturation = dark ? 60 : 79; // Vibrant saturation for selects
          const lightness = dark ? 50 : 80;
          const vibrantColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
          document.documentElement.style.setProperty('--select-primary-color', vibrantColor);
        }
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
      case 'resistor-calculator':
        return <ResistorCalculator onBackToHome={handleBackToHome} />;
      case 'steinhart-hart-calculator':
        return <SteinhartHartCalculator onBackToHome={handleBackToHome} />;
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
