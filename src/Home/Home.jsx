import { FaHome } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';
import PageHeader from '../components/PageHeader/PageHeader';
import translations from '../Translation/Translations';
import { FUNCTION_CARDS, TOTAL_FUNCTIONS, VIEW_TO_INDEX } from '../config/functionCards';
import './Home.scss';

function Home({ onNavigate }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.en;

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
    title: t[card.titleKey],
    description: t[card.descriptionKey],
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
      <PageHeader
        title={<><FaHome /> {t.homeTitle}</>}
        description={t.homeSubtitle}
        languageSelectorVariant="default"
      />
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
              <div className="home__function-cta">{t.clickToOpen} →</div>
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
