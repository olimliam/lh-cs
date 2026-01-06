import React from 'react';
import { IconProps } from '@/types/icon.type';

export const LobbyIcon: React.FC<IconProps> = ({
  width,
  height,
  fill,
  viewBox,
  ...props
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox={viewBox}
      fill={fill}
      {...props}
    >
      <mask
        id='mask0_465_3349'
        style={{ maskType: 'alpha' }}
        maskUnits='userSpaceOnUse'
        x='0'
        y='0'
        width={width}
        height={height}
      >
        <rect x='0.5' width={width} height={height} fill={fill} />
      </mask>
      <g mask='url(#mask0_465_3349)'>
        <path
          d='M4.5 21C4.21667 21 3.97917 20.9042 3.7875 20.7125C3.59583 20.5208 3.5 20.2833 3.5 20C3.5 19.7167 3.59583 19.4792 3.7875 19.2875C3.97917 19.0958 4.21667 19 4.5 19H5.5V5C5.5 4.45 5.69583 3.97917 6.0875 3.5875C6.47917 3.19583 6.95 3 7.5 3H17.5C18.05 3 18.5208 3.19583 18.9125 3.5875C19.3042 3.97917 19.5 4.45 19.5 5V19H20.5C20.7833 19 21.0208 19.0958 21.2125 19.2875C21.4042 19.4792 21.5 19.7167 21.5 20C21.5 20.2833 21.4042 20.5208 21.2125 20.7125C21.0208 20.9042 20.7833 21 20.5 21H4.5ZM7.5 19H17.5V5H7.5V19ZM14.5 13C14.7833 13 15.0208 12.9042 15.2125 12.7125C15.4042 12.5208 15.5 12.2833 15.5 12C15.5 11.7167 15.4042 11.4792 15.2125 11.2875C15.0208 11.0958 14.7833 11 14.5 11C14.2167 11 13.9792 11.0958 13.7875 11.2875C13.5958 11.4792 13.5 11.7167 13.5 12C13.5 12.2833 13.5958 12.5208 13.7875 12.7125C13.9792 12.9042 14.2167 13 14.5 13Z'
          fill={fill}
        />
      </g>
    </svg>  
  );
};
