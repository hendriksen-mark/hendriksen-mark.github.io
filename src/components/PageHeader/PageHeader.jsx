import AnimatedButton from '../AnimatedButton/AnimatedButton';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import translations from '../../Translation/Translations';
import { FaHome } from 'react-icons/fa';
import './PageHeader.scss';

function PageHeader({ onBackToHome, title, description, languageSelectorVariant }) {
    const { language } = useLanguage();
    const t = translations[language] || translations.en;
    return (
        <div className="page-header">
            <div className="page-header__content">
                <div className="page-header__back-button">
                    {onBackToHome && (
                        <AnimatedButton color="gray" onClick={onBackToHome}>
                            <FaHome />
                            {' ' + t.backToHome}
                        </AnimatedButton>
                    )}
                </div>
                <div className="page-header__title-section">
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
                <div className="page-header__language-selector">
                    <LanguageSelector variant={languageSelectorVariant} />
                </div>
            </div>
        </div>
    );
}

export default PageHeader;
