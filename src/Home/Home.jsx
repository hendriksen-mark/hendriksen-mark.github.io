import { FaCalendarAlt, FaCog, FaHome } from 'react-icons/fa';
import './Home.scss';

function Home({ onNavigate }) {
  const functions = [
    {
      id: 'game-schedule',
      title: 'Game Schedule Generator',
      description: 'Genereer en beheer speelschema\'s voor toernooien',
      icon: <FaCalendarAlt />,
      color: '#4CAF50'
    },
    // Add more functions here in the future
    {
      id: 'coming-soon',
      title: 'More Functions Coming Soon',
      description: 'Aanvullende tools en hulpprogramma\'s worden hier toegevoegd',
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
        <FaHome className="home__header-icon" />
        <h1 className="home__title">Mark Hendriksen's Tools</h1>
        <p className="home__subtitle">Een verzameling handige hulpprogramma's en tools</p>
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
              <div className="home__function-cta">Klik om te openen →</div>
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
