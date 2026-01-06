import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  GNBMainTitle,
  GNBSubTitle,
  ConsultationEndModal,
  HamburgerMenuIcon,
  LogoutButton,
} from '../../../shared/ui';
import type { GNBWidgetProps } from '../model';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { useLocation } from 'react-router-dom';
import { GnbProfile } from './gnb-profile';

// Styled Components based on Figma design
export const GNBContainer = styled.header`
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1200;
  padding: 0 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const GNBLeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const GNBLogoImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: contain;
`;

export const GNBTextSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const GNBRightSection = styled.div`
  margin-left: auto;
`;

const MenuButton = styled.button`
  display: flex;
  padding: 8px;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  border: 1px solid rgba(0, 85, 162, 0.5);
  background: rgba(0, 85, 162, 0.1);
`;

const GNBWidget: React.FC<GNBWidgetProps> = ({
  handleTabletLnbToggle,
  toggleLogoutModal,
}) => {
  const { isTablet } = useDeviceDetector();
  const [isConsultationEndModalOpen, setIsConsultationEndModalOpen] =
    useState(false);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleConsultationEndClick = () => {
    setIsConsultationEndModalOpen(true);
  };

  const handleConfirmConsultationEnd = () => {
    // 상담 종료 확인 로직
    console.log('상담 종료 확인');
  };

  return (
    <>
      <GNBContainer>
        <GNBLeftSection>
          {currentPath.includes('/management') ? (
            <GNBLogoImage src='/logo/lh-brand-logo.svg' alt='LH Logo' />
          ) : (
            <a href='/'>
              <GNBLogoImage src='/logo/lh-brand-logo.svg' alt='LH Logo' />
            </a>
          )}

          <GNBTextSection>
            <GNBMainTitle>
              {currentPath.includes('/management')
                ? '서비스 관리'
                : '상담원 페이지'}
            </GNBMainTitle>
            <GNBSubTitle>3D 가상현실 기반 유지 보수 상담 서비스</GNBSubTitle>
          </GNBTextSection>
        </GNBLeftSection>

        <GNBRightSection>
          <>
            {!isTablet ? (
              <>
                {currentPath.includes('/management') ? (
                  <GnbProfile />
                ) : (
                  <LogoutButton
                    onClick={() => {
                      if (toggleLogoutModal) {
                        toggleLogoutModal();
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <MenuButton onClick={() => handleTabletLnbToggle()}>
                <HamburgerMenuIcon />
              </MenuButton>
            )}
          </>
        </GNBRightSection>
      </GNBContainer>

      {currentPath.includes('/management') && (
        <ConsultationEndModal
          open={isConsultationEndModalOpen}
          onClose={handleConsultationEndClick}
          onConfirm={handleConfirmConsultationEnd}
        />
      )}
    </>
  );
};

export default GNBWidget;
