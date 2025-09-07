import React from 'react';
import './AnimatedButton.scss';

const AnimatedButton = ({ 
  children, 
  color = 'blue', 
  disabled = false, 
  onClick, 
  className = '',
  type = 'button',
  ...props 
}) => {
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`animated-button animated-button--${color} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default AnimatedButton;
