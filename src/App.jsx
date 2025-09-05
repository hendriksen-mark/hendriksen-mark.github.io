import { useState } from 'react';
import Home from './Home/Home';
import GameSchedule from './GameSchedule/GameSchedule';
import { FaHome } from 'react-icons/fa';
import './App.scss';

function App() {
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
        return <GameSchedule />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="app">
      {currentView !== 'home' && (
        <nav className="app__nav">
          <button 
            className="app__nav-button" 
            onClick={handleBackToHome}
            title="Terug naar home"
          >
            <FaHome />
            <span>Terug naar home</span>
          </button>
        </nav>
      )}
      <main className="app__main">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
