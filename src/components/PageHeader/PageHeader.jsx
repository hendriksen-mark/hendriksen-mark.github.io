import AnimatedButton from '../AnimatedButton/AnimatedButton';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import { FaHome } from 'react-icons/fa';
import './PageHeader.scss';

function PageHeader({ onBackToHome, backToHomeText, title, description, languageSelectorVariant }) {
    return (
        <div className="page-header">
            <div className="page-header__content">
                <div className="page-header__back-button">
                    <AnimatedButton color="gray" onClick={onBackToHome}>
                        <FaHome />
                        {' ' + backToHomeText}
                    </AnimatedButton>
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
