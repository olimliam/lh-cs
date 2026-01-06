import React from 'react';

export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({ 
  size = 24, 
  color = '#90C31F' 
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={color} />
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);