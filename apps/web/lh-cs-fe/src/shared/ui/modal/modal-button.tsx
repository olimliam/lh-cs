import React from 'react';
import { Button } from '@mui/material';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '../typography';

interface ModalButtonProps {
  onClick: () => void;
  variant: 'primary' | 'primary_02' | 'reject' | 'white';
  isFullFilled?: boolean;
  children: React.ReactNode;
  className?: string;
}
const ButtonText = styled.div<{
  buttonvariant: 'primary' | 'primary_02' | 'reject' | 'white';
}>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: ${(props) =>
    props.buttonvariant === 'primary'
      ? '#0055A2'
      : props.buttonvariant === 'primary_02'
        ? '#90C31F'
        : props.buttonvariant === 'white'
          ? 'white'
          : '#CE2E36'};
  white-space: pre;
`;

const StyledButton = styled(Button)<{
  buttonvariant: 'primary' | 'primary_02' | 'reject' | 'white';
  isFullFilled?: boolean;
}>`
  flex: 1;
  border-radius: 4px;
  padding: 10px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  box-shadow: none;
  text-transform: none;

  ${(props) =>
    props.buttonvariant === 'primary'
      ? `
    background: transparent;
    border: 1px solid #0055A2;
    
    &:hover {
      background: rgba(0, 85, 162, 0.05);
      box-shadow: none;
    }
  `
      : props.buttonvariant === 'primary_02'
        ? `
    background: transparent;
    border: 1px solid #90C31F;
    
    &:hover {
      background: rgba(144, 195, 31, 0.05);
      box-shadow: none;
    }
  `
        : props.buttonvariant === 'white'
          ? `
    background: transparent;
    border: 1px solid #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.05);
      box-shadow: none;
    }
  `
          : `
    background: transparent;
    border: 1px solid #CE2E36;
    
    &:hover {
      background: rgba(206, 46, 54, 0.05);
      box-shadow: none;
    }
  `}

  &.full-filled {
    ${(props) =>
      props.buttonvariant === 'primary'
        ? `
    background: #0055a2;
    border: none;
    ${ButtonText} {
      color: #ffffff;
    }
    
    &:hover {
      background: rgba(0, 85, 162, 0.80);
      box-shadow: none;
    }
  `
        : props.buttonvariant === 'primary_02'
          ? `
    background: #90C31F;
    border: 1px solid #90C31F;
    ${ButtonText} {
      color: #ffffff;
    }
    
    &:hover {
      background: rgba(144, 195, 31, 0.80);
      border-color: #90C31F;
      box-shadow: none;
    }
  `
          : props.buttonvariant === 'white'
            ? `
    background: #ffffff;
    border: 1px solid #fff;
    ${ButtonText} {
      color: #666;
    }
    
    &:hover {
      background: rgba(255, 255, 255, 0.80);
      border-color: #fff;
      box-shadow: none;
    }
  `
            : `
    background: #CE2E36;
    border: 1px solid #CE2E36;
    ${ButtonText} {
      color: #ffffff;
    }
    
    &:hover {
      background: rgba(206, 46, 54, 0.80);
      border-color: #CE2E36;
      box-shadow: none;
    }
  `}
  }
`;

export const ModalButton: React.FC<ModalButtonProps> = ({
  onClick,
  className,
  variant,
  isFullFilled,
  children,
}) => {
  return (
    <StyledButton
      className={`${className || ''} ${isFullFilled ? 'full-filled' : ''}`}
      onClick={onClick}
      buttonvariant={variant}
    >
      <ButtonText buttonvariant={variant}>{children}</ButtonText>
    </StyledButton>
  );
};
