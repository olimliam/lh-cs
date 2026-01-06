import { SvgIcon } from '@mui/material';

interface Props {
  width?: number;
  height?: number;
  // size?: number;
}

export const ArrowBackStepIcon = ({ width = 18, height = 16 }: Props) => {
  return (
    <SvgIcon
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.max(width, height)}px`,
      }}
    >
      <svg viewBox='0 0 18 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M10 1H6.25C4.85761 1 3.52226 1.55312 2.53769 2.53769C1.55312 3.52226 1 4.85761 1 6.25C1 7.64239 1.55312 8.97774 2.53769 9.96231C3.52226 10.9469 4.85761 11.5 6.25 11.5H16M13.5 15L17 11.5L13.5 8'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        />
      </svg>
    </SvgIcon>
  );
};
