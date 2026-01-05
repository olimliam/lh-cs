import styled from '@emotion/styled';

export const StyledLineBtn = styled.button<{
  $isSelected: boolean;
}>`
  position: relative;
  width: 48px;
  height: 12px;
  border-radius: 4px;
  background-color: ${(props) => (props.$isSelected ? '#333' : 'transparent')};
`;

export const StyledLineBtnInnerSpan = styled.span<{
  $strokeHeight: number;
  $isSelected: boolean;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: ${(props) => props.$strokeHeight + 'px'};
  border-radius: 9999px;
  background-color: ${(props) => (props.$isSelected ? '#fff' : '#333')};
`;
