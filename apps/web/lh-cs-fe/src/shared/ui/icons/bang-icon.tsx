import React from 'react';

export const BangIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = 24, 
  color = '#0055A2' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);