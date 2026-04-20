import React from 'react';
import { T } from '../../../utils/design-system';

export const Button = ({ children, variant = 'secondary', icon: Icon, onClick, className = '', style = {}, disabled = false, ...props }) => {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';
  
  const baseStyle = {
    fontSize: 12,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style
  };

  const primaryStyle = {
    ...baseStyle,
    background: T.brand,
    color: '#fff',
    padding: '6px 12px',
    borderRadius: 6,
  };

  const secondaryStyle = {
    ...baseStyle,
    background: 'transparent',
    color: T.t3,
    border: `1px solid ${T.bd}`,
    padding: '6px 12px',
    borderRadius: 6,
  };

  const ghostStyle = {
    ...baseStyle,
    background: 'transparent',
    color: T.t4,
    padding: '4px 8px',
    borderRadius: 6,
  };

  const handleMouseEnter = (e) => {
    if (disabled) return;
    if (isPrimary) e.currentTarget.style.background = T.accent;
    else if (isGhost) {
      e.currentTarget.style.color = T.t2;
      e.currentTarget.style.background = T.muted;
    }
    else {
      e.currentTarget.style.background = T.muted;
      e.currentTarget.style.color = T.t2;
    }
  };

  const handleMouseLeave = (e) => {
    if (disabled) return;
    if (isPrimary) e.currentTarget.style.background = T.brand;
    else if (isGhost) {
      e.currentTarget.style.color = T.t4;
      e.currentTarget.style.background = 'transparent';
    }
    else {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = T.t3;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={isPrimary ? primaryStyle : isGhost ? ghostStyle : secondaryStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {Icon && <Icon size={13} strokeWidth={isPrimary ? 2 : 1.5} />}
      {children}
    </button>
  );
};
