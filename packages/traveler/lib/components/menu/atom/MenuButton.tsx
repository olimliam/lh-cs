/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import {
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';

export const MenuButton = styled.button<{
  isActive?: boolean;
  barStyle: ControlBarStyle;
}>`
  min-width: 52px;
  padding: 1rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  color: #e1e1e6;
  border-radius: 0.375rem;

  @media (min-width: 640px) {
    min-width: 47px;
    width: 2.7rem;
    height: 2.7rem;
    padding: 0;
    justify-content: center;
  }

  ${({ barStyle }) =>
    barStyle === ControlBarStyleConst.ROUND_WHITE &&
    `
      color: #2d2d2d;
    `}

  ${({ isActive, barStyle }) => {
    if (!isActive) return;
    if (barStyle === ControlBarStyleConst.SQUARE_BLACK) {
      return `
        color: white;
        background-color: rgba(255, 255, 255, 0.3);
      `;
    }
    if (barStyle === ControlBarStyleConst.CLEAR_WHITE) {
      return `
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
      `;
    }
    if (barStyle === ControlBarStyleConst.ROUND_WHITE) {
      return `
        color: white;
        background-color: rgba(0, 0, 0, 0.3);
      `;
    }
    return `
      color: #555555;
      background-color: white;
    `;
  }}
`;
