import { FaGlobe } from 'react-icons/fa';
import { useLanguage } from '../../contexts/LanguageContext';
import StyledSelect from '../StyledSelect/StyledSelect';

function LanguageSelector({ variant = 'default' }) {
  const { language, setLanguage } = useLanguage();

  const options = [
    { value: 'nl', label: 'Nederlands' },
    { value: 'en', label: 'English' }
  ];

  const currentValue = options.find(option => option.value === language);

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
