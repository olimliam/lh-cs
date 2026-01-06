/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { PropsWithChildren, useCallback, useMemo, useState } from 'react';
import {
  ControlBarPosition,
  ControlBarPositionConst,
  ControlBarStyle,
  ControlBarStyleConst,
  MenuType,
} from '../../../types/controller-bar';
import { useToolbar } from '../../../contexts/ToolBarContext';

// Animation keyframes
const getSlideEnter = (position: ControlBarPosition) => {
  if (position === ControlBarPositionConst.TOP) {
    return keyframes`
      from { transform: translate(-50%, -20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    `;
  }
  if (position === ControlBarPositionConst.LEFT) {
    return keyframes`
      from { transform: translate(-20px, 50%); opacity: 0; }
      to { transform: translate(0, 50%); opacity: 1; }
    `;
  }
  if (position === ControlBarPositionConst.RIGHT) {
    return keyframes`
      from { transform: translate(20px, 50%); opacity: 0; }
      to { transform: translate(0, 50%); opacity: 1; }
    `;
  }
  return keyframes`
    from { transform: translate(-50%, 20px); opacity: 0; }
    to { transform: translate(-50%, 0); opacity: 1; }
  `;
};

const getSlideExit = (position: ControlBarPosition) => {
  if (position === ControlBarPositionConst.TOP) {
    return keyframes`
      from { transform: translate(-50%, 0); opacity: 1; }
      to { transform: translate(-50%, -20px); opacity: 0; }
    `;
  }
  if (position === ControlBarPositionConst.LEFT) {
    return keyframes`
      from { transform: translate(0, 50%); opacity: 1; }
      to { transform: translate(-20px, 50%); opacity: 0; }
    `;
  }
  if (position === ControlBarPositionConst.RIGHT) {
    return keyframes`
      from { transform: translate(0, 50%); opacity: 1; }
      to { transform: translate(20px, 50%); opacity: 0; }
    `;
  }
  return keyframes`
    from { transform: translate(-50%, 0); opacity: 1; }
    to { transform: translate(-50%, 20px); opacity: 0; }
  `;
};

const Root = styled.div<{
  isContent: boolean;
  barPosition: ControlBarPosition;
  barStyle: ControlBarStyle;
}>`
  position: absolute;
  bottom: calc(100% + 8px);
  transform: translateX(-50%);
  border: 1px solid white;
  border-radius: 0.375rem;
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
  user-select: none;

  ${({ barPosition }) => {
    if (barPosition === ControlBarPositionConst.TOP)
      return css`
        bottom: auto;
        top: calc(100% + 8px);
      `;
    if (barPosition === ControlBarPositionConst.LEFT)
      return css`
        bottom: 0;
        left: calc(100% + 8px);
        transform: translateX(0) translateY(50%);
      `;
    if (barPosition === ControlBarPositionConst.RIGHT)
      return css`
        bottom: 0;
        left: auto;
        right: calc(100% + 8px);
        transform: translateX(0) translateY(50%);
      `;
  }}
  ${({ barStyle }) => {
    if (barStyle === ControlBarStyleConst.SQUARE_BLACK)
      return css`
        border: 0;
        border-radius: 0.25rem;
      `;
    if (barStyle === ControlBarStyleConst.CLEAR_WHITE)
      return css`
        background: linear-gradient(
            175deg,
            rgba(0, 0, 0, 0.02) 0.94%,
            rgba(0, 0, 0, 0) 20.92%
          ),
          linear-gradient(
            177deg,
            rgba(255, 255, 255, 0.17) 7.16%,
            rgba(188, 188, 188, 0.15) 97.47%
          );
        border: 1px solid rgba(255, 255, 255, 0.9);
        border-radius: 0.25rem;
        backdrop-filter: blur(15px);
      `;
    if (barStyle === ControlBarStyleConst.ROUND_WHITE)
      return css`
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(2px);
        border: 1px solid #d1d5db;
      `;
  }}
  ${({ isContent, barPosition }) =>
    isContent
      ? css`
          animation-name: ${getSlideEnter(barPosition)};
        `
      : css`
          animation-name: ${getSlideExit(barPosition)};
        `}
  animation-duration: 0.5s;
  animation-fill-mode: both;
`;

interface ContentRootProps {
  className?: string;
  type: MenuType;
}

function ContentRoot(props: PropsWithChildren<ContentRootProps>) {
  const [isRoot, setIsRoot] = useState<boolean>(false);

  const { isControllerBar, currentMenu, barPosition, barStyle } = useToolbar();

  const isContent = useMemo(
    () => props.type === currentMenu && isControllerBar,
    [props.type, currentMenu, isControllerBar]
  );

  const handleAnimationEnd = useCallback(
    () => setIsRoot(isContent),
    [isContent]
  );

  return (
    <>
      {(isContent || isRoot) && (
        <Root
          className={props.className}
          isContent={isContent}
          barPosition={barPosition}
          barStyle={barStyle}
          onAnimationEnd={handleAnimationEnd}
        >
          {props.children}
        </Root>
      )}
    </>
  );
}

export default ContentRoot;
