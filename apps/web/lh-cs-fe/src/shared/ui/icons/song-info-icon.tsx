import { IconProps } from '@/types/icon.type';

export const SongInfoIcon: React.FC<IconProps> = ({
  width,
  height,
  viewBox,
  stroke,
  ...props
}) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={width}
      height={height}
      viewBox={viewBox}
      fill='none'
      {...props}
    >
      <path
        d='M1 2.74805C1 2.21761 1.21071 1.70891 1.58579 1.33383C1.96086 0.95876 2.46957 0.748047 3 0.748047H14C14.5304 0.748047 15.0391 0.95876 15.4142 1.33383C15.7893 1.70891 16 2.21761 16 2.74805V15.748H1V2.74805Z'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M8.5 8.06836V12.8584'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <path
        d='M8.49998 6.03267C9.16106 6.03267 9.69698 5.49676 9.69698 4.83567C9.69698 4.17459 9.16106 3.63867 8.49998 3.63867C7.83889 3.63867 7.30298 4.17459 7.30298 4.83567C7.30298 5.49676 7.83889 6.03267 8.49998 6.03267Z'
        fill='white'
      />
      <path
        d='M1 15.748V17.251C1 17.7815 1.21071 18.2902 1.58579 18.6653C1.96086 19.0403 2.46957 19.251 3 19.251H16'
        stroke={stroke}
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
};
