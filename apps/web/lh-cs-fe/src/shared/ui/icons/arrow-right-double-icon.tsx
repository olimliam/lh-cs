import { SvgIcon } from '@mui/material';

export const ArrowRightDoubleIcon = ({
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
        <g id='ic-arrow-right-double'>
          <path
            id='Union'
            fillRule='evenodd'
            clipRule='evenodd'
            d='M8.28033 7.46967C7.98744 7.17678 7.51256 7.17678 7.21967 7.46967C6.92678 7.76256 6.92678 8.23744 7.21967 8.53033L10.6893 12L7.21967 15.4697C6.92678 15.7626 6.92678 16.2374 7.21967 16.5303C7.51256 16.8232 7.98744 16.8232 8.28033 16.5303L12.2803 12.5303C12.5732 12.2374 12.5732 11.7626 12.2803 11.4697L8.28033 7.46967ZM13.0303 7.46967C12.7374 7.17678 12.2626 7.17678 11.9697 7.46967C11.6768 7.76256 11.6768 8.23744 11.9697 8.53033L15.4393 12L11.9697 15.4697C11.6768 15.7626 11.6768 16.2374 11.9697 16.5303C12.2626 16.8232 12.7374 16.8232 13.0303 16.5303L17.0303 12.5303C17.3232 12.2374 17.3232 11.7626 17.0303 11.4697L13.0303 7.46967Z'
            fill={fill}
          />
        </g>
      </svg>
    </SvgIcon>
  );
};
