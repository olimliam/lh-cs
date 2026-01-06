import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '../typography';

// 기본 헤더 컨테이너 스타일
export const BaseHeaderContainer = styled.header`
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1200;
  padding: 0 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  /* 반응형 패딩 */
  @media (max-width: 768px) {
    padding: 0 16px;
    min-height: 56px;
  }
`;

// 고정 헤더 스타일
export const FixedHeaderContainer = styled(BaseHeaderContainer)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
`;

// 헤더 섹션들
export const HeaderLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

export const HeaderRightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const HeaderCenterSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  margin: 0 16px;

  @media (max-width: 768px) {
    margin: 0 8px;
  }
`;

// 로고 관련 스타일
export const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const LogoImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: contain;

  @media (max-width: 768px) {
    width: 48px;
    height: 32px;
  }
`;

export const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 768px) {
    display: none; /* 모바일에서는 로고만 표시 */
  }
`;

// 버튼 기본 스타일
export const BaseHeaderButton = styled.button`
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
  cursor: pointer;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: none;

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 13px;
  }
`;

// 상태별 버튼 스타일
export const PrimaryHeaderButton = styled(BaseHeaderButton)`
  background: #0055a2;
  color: #ffffff;

  &:hover {
    background: #004080;
  }

  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

export const SecondaryHeaderButton = styled(BaseHeaderButton)`
  background: #90c31f;
  color: #ffffff;

  &:hover {
    background: #7ba619;
  }
`;

export const DangerHeaderButton = styled(BaseHeaderButton)`
  background: #ce2e36;
  color: #ffffff;

  &:hover {
    background: #b02830;
  }
`;

export const OutlineHeaderButton = styled(BaseHeaderButton)`
  background: transparent;
  color: #666666;
  border: 1px solid #e2e2e2;

  &:hover {
    background: #f5f5f5;
    border-color: #d0d0d0;
  }
`;

// 정보 표시 패널 스타일
export const InfoPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f5f5f5;
  border: 1px solid #e2e2e2;
  font-family: ${BASE_FONT_FAMILY};

  @media (max-width: 768px) {
    padding: 6px 10px;
    gap: 6px;
  }
`;

export const StatusPanel = styled(InfoPanel)<{
  status?: 'success' | 'warning' | 'error' | 'info';
}>`
  ${({ status }) => {
    switch (status) {
      case 'success':
        return `
          background: rgba(144, 195, 31, 0.1);
          border-color: rgba(144, 195, 31, 0.3);
          color: #5b771e;
        `;
      case 'warning':
        return `
          background: rgba(255, 152, 0, 0.1);
          border-color: rgba(255, 152, 0, 0.3);
          color: #e65100;
        `;
      case 'error':
        return `
          background: rgba(206, 46, 54, 0.1);
          border-color: rgba(206, 46, 54, 0.3);
          color: #ce2e36;
        `;
      case 'info':
      default:
        return `
          background: rgba(0, 85, 162, 0.1);
          border-color: rgba(0, 85, 162, 0.3);
          color: #0055a2;
        `;
    }
  }}
`;

// 아이콘 래퍼
export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  .MuiSvgIcon-root {
    font-size: 18px;
  }
`;
