/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import {
  ControlBarPosition,
  ControlBarPositionConst,
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';

export const BarToggleButton = styled.button<{
  barPosition: ControlBarPosition;
  barStyle: ControlBarStyle;
}>`
  width: 2rem;
  height: 2rem;
  background-color: #1f1f1f;
  color: #d1d1d1;
  z-index: 40;
  position: absolute;
  left: 50%;
  bottom: 1.25rem;
  transform: translateX(-50%);
  border: 1px solid white;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ barPosition }) => {
    if (barPosition === ControlBarPositionConst.TOP) {
      return css`
        bottom: auto;
        top: 1.25rem;
      `;
    }
    if (barPosition === ControlBarPositionConst.LEFT) {
      return css`
        bottom: calc((100% - 80px) / 2);
        left: 1.25rem;
        transform: translateX(0);
        flex-direction: column;
      `;
    }
    if (barPosition === ControlBarPositionConst.RIGHT) {
      return css`
        bottom: calc((100% - 80px) / 2);
        left: auto;
        right: 1.25rem;
        transform: translateX(0);
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
        border-color: #d1d1d1;
        background-color: white;
      `;
    }
    return '';
  }}
`;
