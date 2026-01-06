import React from 'react';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from './typography';

interface EmptyImageProps {
  width?: string;
  height?: string;
  className?: string;
}

const EmptyImageContainer = styled.div<{ width: string; height: string }>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background: #f5f5f5;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #999999;
`;

const EmptyIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #d9d9d9;
`;

const EmptyText = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 12px;
  font-weight: 400;
  color: #999999;
  text-align: center;
`;

export const EmptyImage: React.FC<EmptyImageProps> = ({
  width = '100px',
  height = '100px',
  className,
}) => {
  return (
    <EmptyImageContainer width={width} height={height} className={className}>
      <EmptyIcon>📷</EmptyIcon>
      <EmptyText>이미지 없음</EmptyText>
    </EmptyImageContainer>
  );
};
