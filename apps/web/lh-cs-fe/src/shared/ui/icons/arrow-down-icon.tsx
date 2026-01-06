import { SvgIcon } from '@mui/material';

export const ArrowDownIcon = ({
  width = 12,
  height = 7,
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
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 7' fill='none'>
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M0.908158 0.576127C1.14247 0.341812 1.52237 0.341812 1.75669 0.576127L5.99909 4.81853L10.2415 0.576127C10.4758 0.341812 10.8557 0.341812 11.09 0.576127C11.3243 0.810441 11.3243 1.19034 11.09 1.42465L6.42335 6.09132C6.31083 6.20384 6.15822 6.26706 5.99909 6.26706C5.83996 6.26706 5.68735 6.20384 5.57482 6.09132L0.908158 1.42465C0.673843 1.19034 0.673843 0.810441 0.908158 0.576127Z'
          fill='currentColor'
        />
      </svg>
    </SvgIcon>
  );
};
