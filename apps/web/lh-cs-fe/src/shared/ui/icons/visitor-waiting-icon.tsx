import { SvgIcon } from '@mui/material';

export const VisitorWaitingIcon = ({
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
        fontSize: `${Math.max(width, height)}px`
      }}
    >
      <svg
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        {/* 사람 머리 */}
        <circle cx='12' cy='8' r='3' fill='currentColor'/>
        {/* 사람 몸통 */}
        <path
          d='M6 20V18C6 15.79 7.79 14 10 14H14C16.21 14 18 15.79 18 18V20H6Z'
          fill='currentColor'
        />
        {/* 일반 셔츠 (넥타이 없음) */}
        <path
          d='M10.5 11L11.5 10.5L12.5 10.5L13.5 11L12.5 11.5L11.5 11.5L10.5 11Z'
          fill='white'
        />
      </svg>
    </SvgIcon>
  );
};