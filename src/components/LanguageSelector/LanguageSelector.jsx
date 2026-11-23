import { FaGlobe } from '@markhhh/react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import StyledSelect from '../StyledSelect/StyledSelect';
import translations from '../../Translation/Translations';

function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage } = useLanguage();

  const options = Object.keys(translations).map((code) => {
    const displayName =
      new Intl.DisplayNames([code], { type: 'language' }).of(code) || code;
    return {
      value: code,
      label: displayName.charAt(0).toUpperCase() + displayName.slice(1),
    };
  });

  const currentValue =
    options.find((option) => option.value === language) || options[0];

  return (
    <StyledSelect
      value={currentValue}
      onChange={(selectedOption) => setLanguage(selectedOption.value)}
      options={options}
      icon={FaGlobe}
      variant={variant}
      className="language-selector"
    />
  );
}

export default LanguageSelector;
