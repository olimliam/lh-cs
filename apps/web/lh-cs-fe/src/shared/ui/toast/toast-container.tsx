import React from 'react';
import styled from '@emotion/styled';
import { useToast } from '@/shared/contexts/toast-context';
import { Toast } from './toast-content';

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
`;

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <Container>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </Container>
  );
};
