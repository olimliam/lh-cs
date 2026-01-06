/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { css, keyframes } from '@emotion/react';
import {
  ControlBarPosition,
  ControlBarPositionConst,
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';

const translateStart = (barPosition: ControlBarPosition) => {
  if (barPosition === ControlBarPositionConst.TOP) {
    return 'translate(-50%, -100%)';
  } else if (barPosition === ControlBarPositionConst.LEFT) {
    return 'translate(-100%, 50%)';
  } else if (barPosition === ControlBarPositionConst.RIGHT) {
    return 'translate(100%, 50%)';
  } else {
    return 'translate(-50%, 100%)';
  }
};

const translateEnd = (barPosition: ControlBarPosition) => {
  if (
    barPosition === ControlBarPositionConst.LEFT ||
    barPosition === ControlBarPositionConst.RIGHT
  )
    return 'translate(0, 50%)';
  else return 'translate(-50%, 0)';
};

export const slideEnter = (barPosition: ControlBarPosition) => {
  return keyframes`
    from {
      transform: ${translateStart(barPosition)};
      opacity: 0;
    }
    to {
      transform: ${translateEnd(barPosition)};
      opacity: 1;
      visibility: visible;
    }
  `;
};

export const slideExit = (barPosition: ControlBarPosition) => {
  return keyframes`
    from {
      transform: ${translateEnd(barPosition)};
      opacity: 1;
    }
    to {
      transform: ${translateStart(barPosition)};
      opacity: 0;
      visibility: hidden;
    }
  `;
};

export const BarContent = styled.div<{
  isController: boolean;
  barPosition: ControlBarPosition;
  barStyle: ControlBarStyle;
}>`
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  background-color: #1f1f1f;
  display: flex;
  align-items: center;
  user-select: none;
  border: 1px solid white;
  border-radius: 9999px;
  transform: translateX(-50%);
  z-index: 40;

  ${({ barPosition }) => {
    if (
      barPosition === ControlBarPositionConst.LEFT ||
      barPosition === ControlBarPositionConst.RIGHT
    ) {
      return css`
        width: 5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        padding-top: 1rem;
        padding-bottom: 1rem;
        transform: translateX(0) translateY(50%);
        flex-direction: column;
      `;
    }
    return '';
  }}

  ${({ barStyle }) => {
    if (barStyle === ControlBarStyleConst.SQUARE_BLACK) {
      return css`
        border: 0;
        border-radius: 0.125rem;
      `;
    }
    if (barStyle === ControlBarStyleConst.CLEAR_WHITE) {
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
        border-color: rgba(255, 255, 255, 0.9);
        border-radius: 0.125rem;
        backdrop-filter: blur(15px);
      `;
    }
    if (barStyle === ControlBarStyleConst.ROUND_WHITE) {
      return css`
        background-color: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(2px);
        border-color: #d1d1d1;
      `;
    }
    return '';
  }}

  ${({ isController, barPosition }) =>
    isController
      ? css`
          animation-name: ${slideEnter(barPosition)};
        `
      : css`
          animation-name: ${slideExit(barPosition)};
        `}
  
  animation-duration: 0.5s;
  animation-fill-mode: both;
`;
