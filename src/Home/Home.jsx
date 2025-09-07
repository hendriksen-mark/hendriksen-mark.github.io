import { FaCalendarAlt, FaCog, FaHome, FaBolt, FaRuler } from 'react-icons/fa';
import { GiHexagonalNut } from "react-icons/gi";
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import translations from '../Translation/Translations';
import './Home.scss';

function Home({ onNavigate }) {
  const { language } = useLanguage();

  const functions = [
    {
      id: 'game-schedule',
      title: translations[language].gameScheduleGenerator,
      description: translations[language].gameScheduleDescription,
      icon: <FaCalendarAlt />,
      color: '#4CAF50'
    },
    {
      id: 'thread-calculator',
      title: translations[language].threadCalculatorTitle,
      description: translations[language].threadCalculatorDescription,
      icon: <GiHexagonalNut />,
      color: '#FF9800'
    },
    // Add more functions here in the future
    {
      id: 'coming-soon',
      title: translations[language].moreFunctionsTitle,
      description: translations[language].moreFunctionsDescription,
      icon: <FaCog />,
      color: '#9E9E9E',
      disabled: true
    }
  ];

  const handleFunctionClick = (functionId) => {
    if (functionId === 'game-schedule') {
      onNavigate('game-schedule');
    } else if (functionId === 'thread-calculator') {
      onNavigate('thread-calculator');
    }
    // Add more function handlers here
  };

  return (
    <div className="home">
      <div className="home__header">
        <div className="home__header-content">
          <div className="home__title-section">
            <FaHome className="home__header-icon" />
            <div>
              <h1 className="home__title">{translations[language].homeTitle}</h1>
              <p className="home__subtitle">{translations[language].homeSubtitle}</p>
            </div>
          </div>
          
          <div className="home__language-selector">
            <LanguageSelector variant="default" />
          </div>
        </div>
      </div>

      <div className="home__functions">
        {functions.map((func) => (
          <div
            key={func.id}
            className={`home__function-card ${func.disabled ? 'home__function-card--disabled' : ''}`}
            onClick={() => !func.disabled && handleFunctionClick(func.id)}
            style={{ '--card-color': func.color }}
          >
            <div className="home__function-icon">{func.icon}</div>
            <h3 className="home__function-title">{func.title}</h3>
            <p className="home__function-description">{func.description}</p>
            {!func.disabled && (
              <div className="home__function-cta">{translations[language].clickToOpen} →</div>
            )}
          </div>
        ))}
      </div>

      <div className="home__footer">
        <p>Built with React • Hosted on GitHub Pages</p>
      </div>
    </div>
  );
}

export default Home;
