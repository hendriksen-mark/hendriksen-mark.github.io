import { FaCalendarAlt, FaCog, FaHome, FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../Translation/Translations.jsx';
import './Home.scss';

function Home({ onNavigate }) {
  const { language, setLanguage } = useLanguage();

  const functions = [
    {
      id: 'game-schedule',
      title: translations[language].gameScheduleTitle,
      description: translations[language].gameScheduleHomeDescription,
      icon: <FaCalendarAlt />,
      color: '#4CAF50'
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
    }
    // Add more function handlers here
  };

  return (
    <div className="home">
      <div className="home__header">
        <div className="home__header-top">
          <div className="home__title-section">
            <FaHome className="home__header-icon" />
            <div>
              <h1 className="home__title">{translations[language].homeTitle}</h1>
              <p className="home__subtitle">{translations[language].homeSubtitle}</p>
            </div>
          </div>
          
          <div className="home__language-selector">
            <FaGlobe className="home__language-icon" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="home__language-select"
            >
              <option value="nl">Nederlands</option>
              <option value="en">English</option>
            </select>
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
