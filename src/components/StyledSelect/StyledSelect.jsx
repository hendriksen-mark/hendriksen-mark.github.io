import './StyledSelect.scss';

function StyledSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  icon: Icon, 
  variant = 'default',
  ...props 
}) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <div className={`styled-select styled-select--${variant}`}>
        {Icon && <Icon className="styled-select__icon" />}
        <select 
          value={value} 
          onChange={onChange}
          className="styled-select__select"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default StyledSelect;
