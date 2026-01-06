import { SvgIcon } from '@mui/material';

interface Props {
  width?: number;
  height?: number;
  color: string;
}

export const LineupRightIcon = ({ color, width = 24, height = 24 }: Props) => {
  return (
    <SvgIcon
      sx={{
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${Math.max(width, height)}px`,
      }}
    >
      <svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <g id='ic-lineup-right'>
          <path
            id='Vector (Stroke)'
            fillRule='evenodd'
            clipRule='evenodd'
            d='M20.0607 3.93934C20.6464 4.52513 20.6464 5.47487 20.0607 6.06066L5.06066 21.0607C4.47487 21.6464 3.52513 21.6464 2.93934 21.0607C2.35355 20.4749 2.35355 19.5251 2.93934 18.9393L17.9393 3.93934C18.5251 3.35355 19.4749 3.35355 20.0607 3.93934Z'
            fill={color}
          />
        </g>
      </svg>
    </SvgIcon>
  );
};
