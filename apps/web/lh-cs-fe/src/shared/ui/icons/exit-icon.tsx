import { SvgIcon } from '@mui/material';

export const ExitIcon = ({
  width = 24,
  height = 24,
  color = 'currentColor',
}: {
  width?: number;
  height?: number;
  color?: string;
} = {}) => {
  return (
    <SvgIcon
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.max(width, height)}px`,
      }}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='18'
        height='20'
        viewBox='0 0 18 20'
        fill='none'
      >
        <path
          d='M10.9464 14.5H6.76785V4.37444L2.58926 2.12439H10.9464V5.49883H11.9916V1H0.5V15.6256L6.76785 19V15.6256H11.9916V10.0001H10.9464V14.5ZM17.2143 7.75002L13.0357 4.37444V6.6245H8.85711V8.87441H13.0357V11.1245L17.2143 7.75002Z'
          fill={color}
          stroke={color}
          strokeWidth='0.3'
          strokeLinejoin='round'
        />
      </svg>
    </SvgIcon>
  );
};
