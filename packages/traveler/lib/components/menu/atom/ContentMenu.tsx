/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { PropsWithChildren } from 'react';
import {
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';
import { useToolbar } from '../../../contexts/ToolBarContext';

interface ContentMenuProps {
  isActive?: boolean;
  isLast?: boolean;
  className?: string;
  onClick?: () => void;
}

const getBaseStyles = css`
  @apply z-40 w-full cursor-pointer p-2;
  @apply truncate text-center text-lg text-gray-500;
  @apply border-b border-solid border-gray-800;
`;

const getStylesByBarStyle = (
  barStyle: ControlBarStyle,
  isActive?: boolean,
  isLast?: boolean
) => css`
  ${getBaseStyles}

  ${isLast && 'border-none'}
  ${isActive && 'pointer-events-none font-bold'}
  
  ${barStyle === ControlBarStyleConst.CLEAR_WHITE &&
  `
    @apply border-white text-white;
    ${isActive && '@apply bg-black/30'}
  `}
  
  ${barStyle === ControlBarStyleConst.ROUND_WHITE &&
  `
    @apply border-gray-400 text-gray-800;
    ${isActive && '@apply bg-black/30 text-white'}
  `}
  
  ${isActive &&
  barStyle !== ControlBarStyleConst.CLEAR_WHITE &&
  barStyle !== ControlBarStyleConst.ROUND_WHITE &&
  '@apply text-white'}
`;

const ContentMenu = (props: PropsWithChildren<ContentMenuProps>) => {
  const { barStyle } = useToolbar();

  const handleClick = () => {
    if (props.onClick) props.onClick();
  };

  return (
    <div
      className={props.className}
      css={getStylesByBarStyle(barStyle, props.isActive, props.isLast)}
      onClick={handleClick}
    >
      {props.children}
    </div>
  );
};

export default ContentMenu;
