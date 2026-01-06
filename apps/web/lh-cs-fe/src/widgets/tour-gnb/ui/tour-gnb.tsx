import styled from '@emotion/styled';

import { useCallback, useState } from 'react';

import { CastIcon, GNBMainTitle, GNBSubTitle } from '@/shared/ui';
// import { HelpOutline } from '@mui/icons-material';
import type { TourGNBWidgetProps } from '../model';
import { Button, CircularProgress } from '@mui/material';
import { InfoIcon } from '@/shared/ui/icons/info-icon';

import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { media } from '@/shared/utils';
import { ScreenSyncGuideModal } from '@/features/screen-sync-guide';

// Tour GNB - 기존 GNB 디자인과 동일한 패턴 사용
const TourGNBContainer = styled.header`
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1300;
  padding: 0 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  ${media.fold`
    padding: 0 16px;
  `}
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoImage = styled.img`
  width: 60px;
  height: 40px;
  object-fit: contain;
`;

const TextSection = styled.div`
  cursor: pointer;
  /* display: flex;
  flex-direction: column;
  gap: 2px; */
`;

const HelpIconWrapper = styled.div`
  width: 20px;
  height: 20px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  .MuiSvgIcon-root {
    font-size: 14px;
  }

  & svg path {
    fill: rgba(102, 102, 102, 1);
    /* background-color: rgba(102, 102, 102, 1); */
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SyncButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 6px;

  ${media.mobileLg`
    min-width: 44px;
    padding: 6px 10px;
    justify-content: center;
  `}
`;

const SyncLabel = styled.span`
  ${media.mobileLg`
    display: none;
  `}
`;

const SyncSpinner = styled(CircularProgress)`
  color: inherit;
`;

const TourGNBWidget: React.FC<TourGNBWidgetProps> = ({
  onReOffer,
  onSyncConfirm,
  onSyncSkip,
  onOpenModal,
  syncGuideSteps,
  toggleConsultationInfo,
  isScreenSyncEnabled = true,
  isScreenSyncLoading = false,
}) => {
  const [isSyncGuideOpen, setIsSyncGuideOpen] = useState(false);
  const { isTablet } = useDeviceDetector();

  const handleSyncAction = useCallback(async () => {
    if (onSyncConfirm) {
      await onSyncConfirm();
      return;
    }

    if (onReOffer) {
      await onReOffer();
    }
  }, [onReOffer, onSyncConfirm]);

  const handleSyncSkip = useCallback(async () => {
    if (onSyncSkip) {
      await onSyncSkip();
      return;
    }

    await handleSyncAction();
  }, [handleSyncAction, onSyncSkip]);

  const handleOpenGuide = useCallback(() => {
    setIsSyncGuideOpen(true);
    onOpenModal?.();
  }, [onOpenModal]);

  const handleCloseGuide = useCallback(() => {
    setIsSyncGuideOpen(false);
  }, []);

  return (
    <TourGNBContainer>
      {/* 왼쪽: LH 로고 + "상담실 페이지" + 물음표 아이콘 */}
      <LeftSection>
        <LogoImage src='/logo/lh-brand-logo.svg' alt='LH Logo' />
        <TextSection
          onClick={() => {
            if (toggleConsultationInfo) {
              toggleConsultationInfo();
            }
          }}
        >
          <div className='flex items-center gap-1'>
            <GNBMainTitle>상담실</GNBMainTitle>
            <HelpIconWrapper>
              <InfoIcon width={18} height={18} />
            </HelpIconWrapper>
          </div>
          <GNBSubTitle>
            {!isTablet
              ? '3D 가상현실 기반 유지보수 상담 서비스'
              : '3D 기반 유지보수 상담 서비스'}
          </GNBSubTitle>
        </TextSection>
      </LeftSection>

      {/* 중앙: 비어있음 (파란색 칩 없음) */}

      {/* 오른쪽: 상담원 정보 */}
      <RightSection>
        <SyncButton
          variant='contained'
          color='primary'
          size='small'
          sx={{
            animation: 'pulse 1.5s infinite',
          }}
          onClick={handleOpenGuide}
          disabled={!isScreenSyncEnabled || isScreenSyncLoading}
          aria-busy={isScreenSyncLoading}
        >
          <CastIcon />
          {isScreenSyncLoading && <SyncSpinner size={16} thickness={5} />}
          <SyncLabel>
            {isScreenSyncLoading ? '연결중' : '화면 동기화'}
          </SyncLabel>
        </SyncButton>
      </RightSection>

      <ScreenSyncGuideModal
        open={isSyncGuideOpen}
        onClose={handleCloseGuide}
        onSkip={handleSyncSkip}
        disabled={!isScreenSyncEnabled || isScreenSyncLoading}
        onConfirm={handleSyncAction}
        steps={syncGuideSteps}
      />
    </TourGNBContainer>
  );
};

export default TourGNBWidget;
