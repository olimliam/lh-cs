/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import {
  ControlBarPosition,
  ControlBarPositionConst,
} from '../../../types/controller-bar';

export const BarRoot = styled.div<{ barPosition: ControlBarPosition }>`
  position: absolute;
  left: 50%;
  bottom: 60px;
  z-index: 40;

  ${({ barPosition }) => {
    if (barPosition === ControlBarPositionConst.TOP) {
      return `
        bottom: auto;
        top: 15px;
      `;
    }
    if (barPosition === ControlBarPositionConst.LEFT) {
      return `
        bottom: calc((100% - 80px) / 2);
        left: 15px;
      `;
    }
    if (barPosition === ControlBarPositionConst.RIGHT) {
      return `
        bottom: calc((100% - 80px) / 2);
        left: auto;
        right: 15px;
      `;
    }
    return ''; // 기본값 처리 (선택적으로 추가)
  }}
`;
