import { ButtonVariant } from '@/shared/model/button-variants.type';
import styled from '@emotion/styled';

export const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0; /* flex 컨테이너에서 중요 */
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 36px;
  width: 100%;
  min-height: 0;
`;

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 스크롤바 스타일링 (웹킷 기반 브라우저) */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

export const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  width: 100%;
  flex-shrink: 0; /* 하단 버튼 영역은 항상 고정 크기 유지 */
`;

export const ActionButton = styled.button<{ $variant: ButtonVariant }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 4px;
  border: ${(props) =>
    props.$variant === 'primary'
      ? '1px solid #0055A2'
      : props.$variant === 'secondary'
        ? '1px solid #90C31F'
        : '1px solid #CE2E36'};
  background-color: none;
  color: ${(props) =>
    props.$variant === 'primary'
      ? '#0055A2'
      : props.$variant === 'secondary'
        ? '#90C31F'
        : '#CE2E36'};

  font-size: 16px;
  line-height: 1.3;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          &:hover {
            background-color: rgba(0, 85, 162, 0.05);
          }
        `;
      case 'secondary':
        return `
          &:hover {
            background-color: rgba(144, 195, 31, 0.05);
          }
        `;
      case 'error':
        return `
          &:hover {
            background-color: rgba(206, 46, 54, 0.05);
          }
        `;
      default:
        return '';
    }
  }}

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

export const Title = styled.h2`
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #111111;
  margin: 0;
  padding: 12px 0;
`;
export const Subtitle = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  line-height: normal;
`;

export const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  svg {
    width: 13.15px;
    height: 13.15px;
  }
`;
