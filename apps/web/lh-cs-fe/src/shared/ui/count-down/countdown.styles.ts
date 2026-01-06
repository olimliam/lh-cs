import styled from '@emotion/styled';

export const CountdownText = styled.div<{ bgColor?: string }>`
  font-size: 14px;
  color: #0055a2;
  margin-top: 8px;
  text-align: center;
  padding: 4px 0 4px 8px;
  width: 56px;
  border-radius: 4px;

  ${({ bgColor }) => bgColor && `background-color: ${bgColor};`}
`;
