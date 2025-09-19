import { FaCalendarAlt, FaCog, FaHome, FaBolt, FaRuler, FaCloud } from 'react-icons/fa';
import { BiSolidDollarCircle } from "react-icons/bi";
import { SiCreality } from "react-icons/si";
import { GiHexagonalNut, GiOctopus } from "react-icons/gi";
import { PiMonitorDuotone } from "react-icons/pi";
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
    {
      id: 'maybe',
      title: translations[language].maybeTitle,
      description: translations[language].maybeDescription,
      url: 'https://hendriksen-mark.webredirect.org:81',
      color: '#6a4cff',
      icon: <BiSolidDollarCircle />
    },
    {
      id: 'pihole',
      title: translations[language].piholeTitle,
      description: translations[language].piholeDescription,
      url: 'https://hendriksen-mark.webredirect.org:82',
      color: '#e53935',
      icon: <FaCog />
    },
    {
      id: 'octoprint-crx',
      title: translations[language].octoprintCrxTitle,
      description: translations[language].octoprintCrxDescription,
      url: 'https://hendriksen-mark.webredirect.org:83',
      color: '#43a047',
      icon: <SiCreality />
    },
    {
      id: 'octoprint-aliexpress',
      title: translations[language].octoprintAliexpressTitle,
      description: translations[language].octoprintAliexpressDescription,
      url: 'https://hendriksen-mark.webredirect.org:84',
      color: '#00897b',
      icon: <GiOctopus />
    },
    {
      id: 'p1monitor',
      title: translations[language].p1monitorTitle,
      description: translations[language].p1monitorDescription,
      url: 'https://hendriksen-mark.webredirect.org:85',
      color: '#fbc02d',
      icon: <PiMonitorDuotone />
    },
    {
      id: 'uptimekuma',
      title: translations[language].uptimekumaTitle,
      description: translations[language].uptimekumaDescription,
      url: 'https://hendriksen-mark.webredirect.org:86',
      color: '#00bcd4',
      icon: <FaBolt />
    },
    {
      id: 'nextcloud',
      title: translations[language].nextcloudTitle,
      description: translations[language].nextcloudDescription,
      url: 'https://hendriksen-mark.webredirect.org:443',
      color: '#1976d2',
      icon: <FaCloud />
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

  const handleFunctionClick = (func) => {
    if (func.url) {
      window.open(func.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (func.id === 'game-schedule') {
      onNavigate('game-schedule');
    } else if (func.id === 'thread-calculator') {
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
            onClick={() => !func.disabled && handleFunctionClick(func)}
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
