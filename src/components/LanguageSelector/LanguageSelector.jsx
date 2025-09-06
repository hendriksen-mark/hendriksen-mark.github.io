import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageSelector.scss';

function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`language-selector language-selector--${variant}`}>
      <FaGlobe className="language-selector__icon" />
      <select 
        value={language} 
        onChange={(e) => setLanguage(e.target.value)}
        className="language-selector__select"
      >
        <option value="nl">Nederlands</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
