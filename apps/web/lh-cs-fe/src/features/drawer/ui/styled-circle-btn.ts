import styled from '@emotion/styled';
import { Button } from '@mui/material';

export interface CircleBtnProps {
  $width: number;
  $isSelected: boolean;
  $border?: boolean;
  $shadow?: boolean;
  $borderRadius?: number;
}

export const StyledCircleBtn = styled(Button)<CircleBtnProps>`
  width: ${(props) => props.$width + 'px'};
  height: ${(props) => props.$width + 'px'};
  min-width: ${(props) => props.$width + 'px'};
  border-radius: ${(props) =>
    props.$borderRadius ? props.$borderRadius : 9999 + 'px'};

  color: #333;
  border: ${(props) =>
    props.$isSelected
      ? '1px solid #ccc'
      : props.$border
        ? '1px solid #EEE'
        : '1px solid transparent'};
  background-color: ${(props) => (props.$isSelected ? '#333' : '#fff')};

  box-shadow: ${(props) =>
    props.$shadow ? '0px 4px 12px 0px rgba(17, 17, 17, 0.12)' : 'initial'};
  padding: 0;

  &:hover {
    border: 1px solid #ccc;
    background-color: #eee;
  }

  i {
    filter: ${(props) => (props.$isSelected ? 'invert(100%)' : 'none')};
  }
`;
