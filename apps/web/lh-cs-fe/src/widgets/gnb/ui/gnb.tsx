import React from 'react';
import styled from '@emotion/styled';
import { Switch } from '@mui/material';

const GNBContainer = styled.header`
  background: #fff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: space-between;

  /* 기본 스타일 (모바일 우선) */
  padding: 12px 16px;
  min-height: 56px;

  /* 태블릿 및 데스크톱 (768px 이상) - Figma 디자인 적용 */
  @media (min-width: 768px) {
    padding: 8px 16px;
    min-height: 60px;
  }

  /* 큰 화면 (1024px 이상) */
  @media (min-width: 1024px) {
    padding: 8px 24px;
    min-height: 64px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (min-width: 768px) {
    /* Figma itemSpacing 12px */
    gap: 12px;
  }
`;

// Figma 기반 로고 컨테이너 (54px width, 36px height)
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  width: 48px;
  height: 32px;

  @media (min-width: 768px) {
    /* Figma 기준 크기 */
    width: 54px;
    height: 36px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const SyncLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-right: 8px;
`;

const Divider = styled.div`
  width: 1px;
  height: 32px;
  background: #e5e7eb;
  margin: 0 16px;
`;

const ConsultantAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
`;

const ConsultantName = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #111;
  margin-right: 8px;
`;

const ConsultantRole = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #fff;
  background: #999;
  border-radius: 2px;
  padding: 2px 8px;
`;

export interface GNBProps {
  syncEnabled: boolean;
  onSyncToggle: () => void;
  consultantName: string;
  consultantAvatar: string;
}

const GNB: React.FC<GNBProps> = ({
  syncEnabled,
  onSyncToggle,
  consultantName,
  consultantAvatar,
}) => {
  return (
    <GNBContainer>
      <LeftSection>
        {/* Figma 기반 로고 컨테이너 추가 */}
        <LogoContainer>
          <img src='/images/logo-sm.svg' alt='LH Logo' />
        </LogoContainer>

        <SyncLabel>화면 동기화</SyncLabel>
        <Switch checked={syncEnabled} onChange={onSyncToggle} color='default' />
        <Divider />
        <ConsultantAvatar src={consultantAvatar} alt='상담원' />
        <ConsultantName>{consultantName}</ConsultantName>
        <ConsultantRole>상담원</ConsultantRole>
      </LeftSection>
    </GNBContainer>
  );
};

export default GNB;
