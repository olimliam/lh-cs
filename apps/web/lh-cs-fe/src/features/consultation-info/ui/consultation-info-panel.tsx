import React from 'react';
import styled from '@emotion/styled';
import { Box, Chip, IconButton, Typography } from '@mui/material';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { useConsultationInfoStore } from '../model/consultation-info.store';
import { BASE_FONT_FAMILY } from '@/shared/ui';

// Styled Components following Figma design (node-id=1095-79397)
const InfoPanel = styled(Box)`
  position: fixed;
  top: 16px;
  left: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px 20px;
  min-width: 300px;
  max-width: 400px;
  z-index: 1000;
  border: 1px solid #e2e2e2;
`;

const HeaderSection = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const InfoTitle = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  color: #111111;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoContent = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InfoLabel = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  color: #666666;
`;

const InfoValue = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 14px;
  color: #111111;
`;

const StatusChip = styled(Chip)<{ status: string }>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 12px;
  height: 24px;

  ${({ status }) => {
    switch (status) {
      case 'READY':
        return `
          background-color: rgba(144, 195, 31, 0.1);
          color: #5b771e;
        `;
      case 'CONSULTING':
        return `
          background-color: rgba(0, 85, 162, 0.1);
          color: #0055a2;
        `;
      case 'END':
        return `
          background-color: rgba(206, 46, 54, 0.1);
          color: #ce2e36;
        `;
      default:
        return `
          background-color: rgba(153, 153, 153, 0.1);
          color: #666666;
        `;
    }
  }}
`;

const getStatusText = (status: string) => {
  switch (status) {
    case 'READY':
      return '대기중';
    case 'CONSULTING':
      return '상담중';
    case 'END':
      return '종료됨';
    default:
      return '알 수 없음';
  }
};

export const ConsultationInfoPanel: React.FC = () => {
  const { info, isVisible, toggleVisibility } = useConsultationInfoStore();

  if (!info || !isVisible) {
    return null;
  }

  return (
    <InfoPanel>
      <HeaderSection>
        <InfoTitle>
          <InfoIcon sx={{ fontSize: 18 }} />
          상담실 정보
        </InfoTitle>
        <IconButton
          size='small'
          onClick={toggleVisibility}
          sx={{ color: '#666666' }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </HeaderSection>

      <InfoContent>
        <InfoRow>
          <InfoLabel>상담실 코드</InfoLabel>
          <InfoValue>#{info.consultationCode}</InfoValue>
        </InfoRow>

        {info.roomName && (
          <InfoRow>
            <InfoLabel>상담실명</InfoLabel>
            <InfoValue>{info.roomName}</InfoValue>
          </InfoRow>
        )}

        {info.consultantName && (
          <InfoRow>
            <InfoLabel>상담사</InfoLabel>
            <InfoValue>{info.consultantName}</InfoValue>
          </InfoRow>
        )}

        {info.tourTitle && (
          <InfoRow>
            <InfoLabel>투어</InfoLabel>
            <InfoValue>{info.tourTitle}</InfoValue>
          </InfoRow>
        )}

        {info.facilityTitle && (
          <InfoRow>
            <InfoLabel>시설</InfoLabel>
            <InfoValue>{info.facilityTitle}</InfoValue>
          </InfoRow>
        )}

        <InfoRow>
          <InfoLabel>상태</InfoLabel>
          <StatusChip
            label={getStatusText(info.status)}
            status={info.status}
            size='small'
          />
        </InfoRow>

        {info.joinedAt && (
          <InfoRow>
            <InfoLabel>입장 시간</InfoLabel>
            <InfoValue>
              {new Date(info.joinedAt).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </InfoValue>
          </InfoRow>
        )}

        {typeof info.participantCount === 'number' && (
          <InfoRow>
            <InfoLabel>참여자</InfoLabel>
            <InfoValue>{info.participantCount}명</InfoValue>
          </InfoRow>
        )}
      </InfoContent>
    </InfoPanel>
  );
};
