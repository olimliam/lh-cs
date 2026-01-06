import { SvgIcon } from '@mui/material';

export const PersonIcon = ({
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
      <svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <path
          d='M5.99942 5.68235C7.4129 5.68235 8.55874 4.54463 8.55874 3.14118C8.55874 1.73772 7.4129 0.6 5.99942 0.6C4.58595 0.6 3.4401 1.73772 3.4401 3.14118C3.4401 4.54463 4.58595 5.68235 5.99942 5.68235Z'
          fill='currentColor'
        />
        <path
          d='M5.99873 6.63533C3.11949 6.63533 1.2 7.91526 1.2 9.49415C1.2 10.5467 1.2 11.4 2.26011 11.4H9.83771C10.8118 11.4 10.8061 10.6796 10.7988 9.74619C10.7981 9.66372 10.7975 9.57959 10.7975 9.49415C10.7975 7.91526 8.87796 6.63533 5.99873 6.63533Z'
          fill='currentColor'
        />
      </svg>
    </SvgIcon>
  );
};
