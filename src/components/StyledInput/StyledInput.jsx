import { useId } from 'react';
import './StyledInput.scss';

function StyledInput({
  label,
  type = 'text',
  variant = 'default',
  bare = false,
  className = '',
  ...rest
}) {
  const uid = useId();
  const inputClass = `styled-input styled-input--${variant}${className ? ' ' + className : ''}`;

  if (bare) {
    return (
      <input
        type={type}
        className={inputClass}
        {...rest}
      />
    );
  }

  return (
    <div className="input-group">
      {label && <label htmlFor={uid}>{label}</label>}
      <input
        id={uid}
        type={type}
        className={inputClass}
        {...rest}
      />
    </div>
  );
}

export default StyledInput;
