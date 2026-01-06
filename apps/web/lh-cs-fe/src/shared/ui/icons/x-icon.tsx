import React from 'react';

export const XIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#FF5861',
}) => (
  <svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
    <circle cx='12' cy='12' r='10' fill={color} />
    <path
      d='M15 9l-6 6M9 9l6 6'
      stroke='white'
      strokeWidth='2'
      strokeLinecap='round'
    />
  </svg>
);
