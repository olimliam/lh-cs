import { SvgIcon } from '@mui/material';

export const ConsultingIcon = ({
  width = 24,
  height = 24,
}: {
  width?: number;
  height?: number;
} = {}) => {
  return (
    <SvgIcon
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.max(width, height)}px`,
      }}
    >
      <svg viewBox='0 0 24 24' fill='none'>
        <g opacity='0.9'>
          <circle cx='12' cy='12' r='8.25' stroke='white' strokeWidth='1.5' />
          <path
            d='M12.8145 6.81055C15.3067 7.2124 17.25 9.57335 17.25 12C17.2499 14.6729 14.9005 17.25 12.0645 17.25C10.9599 17.25 9.94203 16.93 9.10547 16.3916L12.6211 12.5029L12.8145 12.2881V6.81055Z'
            fill='white'
            stroke='white'
            strokeWidth='1.5'
          />
        </g>
      </svg>
    </SvgIcon>
  );
};
