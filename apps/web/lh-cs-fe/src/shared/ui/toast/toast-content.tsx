import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { ToastData } from '@/shared/types/toast.types';

interface ToastProps {
  toast: ToastData;
  // onRemove: (id: string) => void;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translate(-50%, 0);
  }
  to {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
`;

const ToastContainer = styled.div<{ isVisible: boolean; borderColor: string }>`
  position: fixed;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 4px;

  background: #ffffff;
  border: 1px solid ${(props) => props.borderColor};
  border-radius: 8px;
  padding: 8px 12px;

  box-shadow: 0px 4px 12px 0px rgba(17, 17, 17, 0.12);

  animation: ${(props) => (props.isVisible ? fadeIn : fadeOut)} 0.3s ease-out;

  width: auto;
  box-sizing: border-box;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
`;

const Message = styled.p`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #111111;
  white-space: pre;
  margin: 0;
  flex-shrink: 0;
`;

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 2.7초 후 fade out 시작
    const timer = setTimeout(() => {
      setIsVisible(false);
      // fade out 완료 후 제거
      // setTimeout(() => onRemove(toast.id), 300);
    }, 2700);

    return () => clearTimeout(timer);
  }, [toast.id]);

  return (
    <ToastContainer isVisible={isVisible} borderColor={toast.color}>
      <IconWrapper>{toast.icon}</IconWrapper>
      <Message>{toast.value}</Message>
    </ToastContainer>
  );
};
