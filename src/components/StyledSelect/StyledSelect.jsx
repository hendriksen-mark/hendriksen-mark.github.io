import Select from "react-select";
import './StyledSelect.scss';

function StyledSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  icon: Icon, 
  variant = 'default',
  placeholder,
  closeMenuOnSelect = true,
  isMulti = false,
  className = '',
  ...props 
}) {
  const selectId = `styled-select-${label?.replace(/\s+/g, '-').toLowerCase() || 'select'}`;
  
  return (
    <div className="input-group">
      <label htmlFor={selectId}>{label}</label>
      <div className={`styled-select styled-select--${variant}`}>
        {Icon && <Icon className="styled-select__icon" />}
        <Select
          inputId={selectId}
          closeMenuOnSelect={closeMenuOnSelect}
          value={value}
          isMulti={isMulti}
          options={options}
          placeholder={placeholder}
          onChange={(selectedOption) => {
            onChange(selectedOption);
          }}
          isSearchable={false}
          className={`styled-select__container ${className}`}
          classNamePrefix="styled-select"
          {...props}
        />
      </div>
    </div>
  );
}

export default StyledSelect;
