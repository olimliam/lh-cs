import styled from '@emotion/styled';
import { COLOR_CHIP, ColorChipType } from '../model/whiteboard.constants';

type StyledColorBtnType = {
  $isSelected: boolean;
  $color: ColorChipType;
};

export const StyledColorBtn = styled.button<StyledColorBtnType>`
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  border: ${(props) => (props.$isSelected ? '2px' : '1px')} solid
    ${(props) =>
      props.$color === COLOR_CHIP.WHITE ? '#e2e2e2' : 'transparent'};
  background-color: ${(props) => props.$color};
`;

export const StyledInnerCircleSpan = styled.span<StyledColorBtnType>`
  display: ${(props) => (props.$isSelected ? 'block' : 'none')};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  border-radius: 9999px;
  background-color: ${(props) => props.$color};
  border: 1px solid
    ${(props) => (props.$color === COLOR_CHIP.WHITE ? '#999999' : '#fff')};
`;
