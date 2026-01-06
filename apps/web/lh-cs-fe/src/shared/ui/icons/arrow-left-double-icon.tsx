import { SvgIcon } from '@mui/material';

export const ArrowLeftDoubleIcon = ({
  width = 24,
  height = 24,
  fill = 'currentColor',
}: {
  width?: number;
  height?: number;
  fill?: string;
} = {}) => {
  return (
    <SvgIcon>
      <svg
        width={width}
        height={height}
        viewBox='0 0 24 24'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
      >
        <g id='ic-arrow-left-double'>
          <path
            id='Union'
            fillRule='evenodd'
            clipRule='evenodd'
            d='M15.7197 16.5303C16.0126 16.8232 16.4874 16.8232 16.7803 16.5303C17.0732 16.2374 17.0732 15.7626 16.7803 15.4697L13.3107 12L16.7803 8.53033C17.0732 8.23744 17.0732 7.76256 16.7803 7.46967C16.4874 7.17678 16.0126 7.17678 15.7197 7.46967L11.7197 11.4697C11.4268 11.7626 11.4268 12.2374 11.7197 12.5303L15.7197 16.5303ZM10.9697 16.5303C11.2626 16.8232 11.7374 16.8232 12.0303 16.5303C12.3232 16.2374 12.3232 15.7626 12.0303 15.4697L8.56066 12L12.0303 8.53033C12.3232 8.23744 12.3232 7.76256 12.0303 7.46967C11.7374 7.17678 11.2626 7.17678 10.9697 7.46967L6.96967 11.4697C6.67678 11.7626 6.67678 12.2374 6.96967 12.5303L10.9697 16.5303Z'
            fill={fill}
          />
        </g>
      </svg>
    </SvgIcon>
  );
};
