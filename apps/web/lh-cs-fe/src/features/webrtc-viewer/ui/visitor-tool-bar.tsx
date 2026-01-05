import { useState, type FC } from 'react';
import styled from '@emotion/styled';
import { basePretendardStyle } from '@/shared/ui/text-styles';
import { SelfCheckDialog } from './visitor-end-dialog';
import { CounselingEndModal } from './counseling-end-modal';
import { useNavigate } from 'react-router-dom';
import { media } from '@/shared/utils';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { ExitIcon } from '@/shared/ui/icons/exit-icon';

const ToolBarWrapper = styled.div`
  position: fixed;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  max-width: 600px;
`;

const ToolBarBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;

  min-height: 98px;
  padding: 12px 16px;

  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const InfoStack = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const InfoLabel = styled.span`
  ${basePretendardStyle}
  font-size: 20px;
  font-weight: 500;
  color: #666666;

  ${media.tablet`
    font-size: 16px;
  `}
`;

const InfoValue = styled.span`
  ${basePretendardStyle}
  font-size: 20px;
  font-weight: 700;
  color: #111111;
  ${media.tablet`
    font-size: 16px;
  `}
`;

const StatusBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 220px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f7f9fc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const StatusTitle = styled.div`
  ${basePretendardStyle}
  font-size: 15px;
  font-weight: 700;
  color: #111111;
`;

const StatusValue = styled.span<{ connected: boolean }>`
  color: ${({ connected }) => (connected ? '#0f9d58' : '#d93025')};
`;

const StatusRow = styled.div`
  ${basePretendardStyle}
  font-size: 14px;
  font-weight: 500;
  color: #444444;
`;

const StatusAction = styled.button`
  ${basePretendardStyle}
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  background: #0055a2;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #00498e;
  }

  &:active {
    background: #003f7a;
  }

  &:disabled {
    background: #aac4df;
    cursor: not-allowed;
  }
`;

const EndButton = styled.button`
  ${basePretendardStyle}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  border-radius: 6px;
  border: none;
  background: #0055a2;
  color: #ffffff;
  font-size: 24px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #00498e;
  }

  &:active {
    background: #003f7a;
  }

  &:disabled {
    background: #aac4df;
    cursor: not-allowed;
  }

  ${media.tablet`
    width: 46px;
    height: 46px;
  `}
`;

interface VisitorToolBarProps {
  tourCdnId: string;
  areaLabel: string;
  areaValue: string;
  facilityLabel: string;
  facilityValue: string;
  signalingConnected?: boolean;
  connectionStateText?: string | null;
  onManualStreamRequest?: () => void;
  isManualRequesting?: boolean;
  onEndConsultationClick?: () => void;
  onSelfCheckClick?: () => void;
  onDialogClose?: () => void;
  isEndButtonDisabled?: boolean;
}

export const VisitorToolBar: FC<VisitorToolBarProps> = ({
  tourCdnId,
  areaLabel = '평형:',
  areaValue = '-',
  facilityLabel = '시설 정보:',
  facilityValue = '-',
  signalingConnected,
  connectionStateText,
  onManualStreamRequest,
  isManualRequesting = false,
  onEndConsultationClick,
  onDialogClose,
  isEndButtonDisabled = false,
}) => {
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [isSelfTourDialogOpen, setIsSelfTourDialogOpen] = useState(false);

  const handleEndClick = () => {
    setIsEndDialogOpen(true);
  };

  const handleCounselingEndClick = () => {
    onEndConsultationClick?.();
    setIsSelfTourDialogOpen(true);
    setIsEndDialogOpen(false);
  };

  const handleDialogClose = () => {
    setIsEndDialogOpen(false);
    onDialogClose?.();
  };
  const navigate = useNavigate();
  const handleSelfCheckClick = () => {
    setIsEndDialogOpen(false);
    if (!tourCdnId) {
      return;
    }
    navigate(`/self-check?tourCdnId=${tourCdnId}`);
  };

  const { isTablet } = useDeviceDetector();

  return (
    <ToolBarWrapper>
      <ToolBarBox>
        <InfoStack>
          <InfoRow>
            <InfoLabel>{areaLabel}</InfoLabel>
            <InfoValue>{areaValue}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>{facilityLabel}</InfoLabel>
            <InfoValue>{facilityValue}</InfoValue>
          </InfoRow>
        </InfoStack>

        {onManualStreamRequest && (
          <StatusBox>
            <StatusTitle>
              시그널링 상태:{' '}
              <StatusValue connected={!!signalingConnected}>
                {signalingConnected ? '연결됨' : '연결 대기'}
              </StatusValue>
            </StatusTitle>
            <StatusRow>WebRTC 상태: {connectionStateText ?? '대기'}</StatusRow>
            <StatusAction
              type='button'
              onClick={onManualStreamRequest}
              disabled={!signalingConnected || isManualRequesting}
            >
              스트리밍 재요청
            </StatusAction>
          </StatusBox>
        )}

        <EndButton
          type='button'
          onClick={handleEndClick}
          disabled={isEndButtonDisabled}
        >
          {isTablet ? <ExitIcon /> : '상담 종료'}
        </EndButton>
      </ToolBarBox>

      <CounselingEndModal
        open={isEndDialogOpen}
        onClose={handleDialogClose}
        onEndConsultation={handleCounselingEndClick}
      />

      <SelfCheckDialog
        open={isSelfTourDialogOpen}
        onClose={handleDialogClose}
        onSelfCheck={handleSelfCheckClick}
        isSelfCheckDisabled={!tourCdnId}
      />
    </ToolBarWrapper>
  );
};
