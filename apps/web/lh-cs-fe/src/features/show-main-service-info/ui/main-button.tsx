import styled from '@emotion/styled';
import { media } from '@/shared/utils';
import { ButtonVariant } from '@/shared/model/button-variants.type';

interface ButtonProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  id?: string;
}

// Figma 스타일 기반 버튼 컴포넌트
const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 36px 0;
  border-radius: 10px;
  font-weight: 500;
  line-height: 130%;
  border: 1px solid;
  transition: all 0.3s ease;
  color: #333;
  text-align: left;
  width: 50%;

  & .button-text {
    display: flex;
    flex-direction: column;
    gap: 8px;
    line-height: normal;
  }

  & .point-text {
    font-size: 28px;
    font-weight: 700;
  }

  &:hover .button-icon {
    background-color: rgba(255, 255, 255, 0.1);

    & svg path {
      stroke: #ffffff;
    }
  }

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background-color: #F8FCFF;
          border-color: #0055A2;
          & .point-text {
            color: #0055A2;
          }
          
          &:hover {
            color: #ffffff;
            background: linear-gradient(180deg, #0055A2 0%, #2B7FCB 100%);
            box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
            & .point-text {
              color: #fff;
            }
          }
        `;
      case 'secondary':
        return `
          background-color: #FDFFFA;
          border-color: #90C31F;
          & .point-text {
            color: #90C31F;
          }
          
          &:hover {
            color: #ffffff;
            background: linear-gradient(180deg, #90C31F 0%, #74A800 100%);
            box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
            & .point-text {
              color: #fff;
            }
          }
        `;
      default:
        return '';
    }
  }}

  /* 아이콘 색상 변경을 위한 스타일 */
  svg {
    transition: all 0.3s ease;
    stroke: currentColor;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  ${media.tablet`
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 16px 0;
    & .button-text {
      font-size: 14px;
    }

    & .point-text {
      font-size: 20px;
    }
  `}

  ${media.fold`
    width: 100%;
    flex-direction: row;
    & .point-text {
      font-size: 18px;
    }
  `}
`;

const IconWrapper = styled.span<{ $variant: ButtonVariant }>`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background-color: rgba(0, 85, 162, 0.10);
        `;
      case 'secondary':
        return `
          background-color: rgba(144, 195, 31, 0.1);
        `;
      default:
        return '';
    }
  }}
  border-radius: 100%;

  ${media.fold`
    width: 48px;
    height: 48px;
  `}
`;

export const MainButton: React.FC<ButtonProps> = ({
  className = '',
  children,
  onClick,
  variant = 'primary',
  icon,
  id,
  ...props
}) => (
  <StyledButton
    className={className}
    onClick={onClick}
    $variant={variant}
    id={id}
    {...props}
  >
    {icon && (
      <IconWrapper $variant={variant} className='button-icon'>
        {icon}
      </IconWrapper>
    )}
    <span className='button-text'>{children}</span>
  </StyledButton>
);
