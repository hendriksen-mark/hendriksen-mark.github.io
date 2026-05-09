import { FaHome } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector/LanguageSelector';
import translations from '../Translation/Translations';
import { FUNCTION_CARDS, TOTAL_FUNCTIONS, VIEW_TO_INDEX } from '../config/functionCards';
import './Home.scss';

function Home({ onNavigate }) {
  const { language } = useLanguage();

  // Generate color for function card if not explicitly set
  const getCardColor = (func) => {
    if (func.color) return func.color;
    const i = VIEW_TO_INDEX[func.id];
    if (i === undefined) return '#9E9E9E';

    const hue = (360 / TOTAL_FUNCTIONS) * i;
    const saturation = 79;
    const lightness = 43;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const functions = FUNCTION_CARDS.map((card) => ({
    ...card,
    title: translations[language][card.titleKey],
    description: translations[language][card.descriptionKey],
  }));

  const handleFunctionClick = (func) => {
    if (func.url) {
      window.open(func.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (func.id) {
      onNavigate(func.id);
    }
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
            style={{ '--card-color': getCardColor(func) }}
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
