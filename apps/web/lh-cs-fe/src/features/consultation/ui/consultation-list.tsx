import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';
import { BASE_FONT_FAMILY, EmptyImage } from '@/shared/ui';
import { useConsultationTimer } from '@/shared/hooks/use-consultation-timer';
import { useConsultationEndTimer } from '@/shared/hooks/use-consultation-end-timer';
import {
  parseTimeWithKST,
  detectServerTimezone,
} from '@/shared/utils/parse-time-with-kst';
import {
  getConsultationStatusColor,
  getConsultationStatusBackgroundColor,
  getConsultationStatusTextColor,
} from '@/shared/utils/consultation-status-colors';
import styled from '@emotion/styled';
import React, { useMemo, useState, useEffect } from 'react';
import type {
  ConsultationCardProps,
  ConsultationListProps,
} from '../model/consultation.types';

import dayjs from 'dayjs';
import { CopyIcon } from '@/shared/ui/icons/copy-icon';
import { ConsultingIcon } from '@/shared/ui/icons/consulting-icon';
import { EndIcon } from '@/shared/ui/icons/end-icon';
import { ReadyIcon } from '@/shared/ui/icons/ready-icon';
import { media } from '@/shared/utils';
import { EnterIcon } from '@/shared/ui/icons/enter-icon';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

// Styled Components
const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
`;

const RoomCard = styled.div<{ status: ConsultationStatusEnum }>`
  background: #f5f5f5;
  border: 1px solid #e2e2e2;
  border-radius: 6px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  overflow: hidden;
  position: relative;
  width: 100%;

  &:hover {
    border-color: #0055a2;
    box-shadow: 0px 2px 8px rgba(0, 85, 162, 0.1);
  }
`;

const StatusBar = styled.div<{ status: ConsultationStatusEnum }>`
  width: 8px;
  min-width: 8px;
  background-color: ${(props) => getConsultationStatusColor(props.status)};
`;

const CardContent = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: calc(100% - 8px);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
`;

const RoomNumberBadge = styled.div`
  background: rgba(17, 17, 17, 0.08);
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

const RoomNumber = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 24px;
  line-height: 1.3;
  color: #111111;
`;

const Separator = styled.div`
  width: 1px;
  height: 16px;
  background: #999999;
`;

const RoomCode = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: #333333;
`;

const StatusSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const StatusInfo = styled.div<{ status: ConsultationStatusEnum }>`
  background: ${(props) => getConsultationStatusBackgroundColor(props.status)};
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  gap: 4px;
  align-items: center;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  line-height: 1.3;
  color: ${(props) => getConsultationStatusTextColor(props.status)};
`;

const StatusTime = styled.span`
  font-weight: 700;
`;

const StatusText = styled.span`
  font-weight: 500;
`;

const StatusBadgeMain = styled.div<{ status: ConsultationStatusEnum }>`
  background: ${(props) => getConsultationStatusColor(props.status)};
  border-radius: 4px;
  padding: 6px 8px 6px 8px;
  display: flex;
  gap: 4px;
  align-items: center;
  height: 30px;

  ${media.tablet`
    height: 24px;
    
  `}
`;

const StatusIcon = styled.div`
  width: 24px;
  height: 24px;
  color: #ffffff;
`;

const StatusLabel = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 18px;
  line-height: 1.5;
  color: #ffffff;

  ${media.tablet`
    font-size: 16px;
  `}
`;

const MainContent = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
`;

const Thumbnail = styled.div`
  width: 143px;
  height: 143px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 4px;
  flex-shrink: 0;
`;

const RoomDetails = styled.div`
  flex: 1;
  // min-width: 470px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const DetailInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DetailRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const DetailLabel = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 16px;
  line-height: 1.3;
  color: #666666;
`;

const DetailValue = styled.span`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  color: #111111;
`;

const DetailSeparator = styled.div`
  width: 1px;
  height: 14px;
  background: #999999;
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

const CopyButton = styled.button`
  background: rgba(114, 113, 113, 0.1);
  border: 1px solid rgba(114, 113, 113, 0.5);
  border-radius: 4px;

  padding: 10px 16px 10px 12px;
  justify-content: center;
  align-items: center;
  gap: 4px;

  height: 46px;

  display: flex;
  gap: 4px;
  cursor: pointer;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  color: #727171;
  text-transform: uppercase;
  letter-spacing: 0.46px;

  &:hover {
    background: rgba(114, 113, 113, 0.2);
  }

  ${media.tablet`
    height: 34px;
    font-size: 14px;
  `}
`;

const EnterCodeInfo = styled.button`
  border-radius: 4px;
  background: rgba(114, 113, 113, 0.1);

  display: flex;
  padding: 4px 8px;
  align-items: center;
  gap: 6px;

  cursor: pointer;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  line-height: 1.3;
  color: #727171;
  text-transform: uppercase;
  letter-spacing: 0.46px;
`;

const CopyIconBox = styled.div`
  width: 24px;
  height: 24px;
  color: #727171;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button<{ variant?: 'danger'; disabled?: boolean }>`
  padding: 10px 16px 10px 12px;
  gap: 4px;
  border-radius: 4px;
  border: 1px solid
    ${(props) => (props.variant === 'danger' ? '#d32f2f' : '#0055a2')};
  background: ${(props) =>
    props.variant === 'danger' ? '#CE2E361A' : '#0055A21A'};
  color: ${(props) => (props.variant === 'danger' ? '#d32f2f' : '#0055A2')};
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;

  &:hover {
    background: ${(props) =>
      props.variant === 'danger'
        ? 'rgba(206, 46, 54, 0.20)'
        : 'rgba(0, 85, 162, 0.20)'};
  }
  height: 46px;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  ${media.tablet`
    font-size: 14px;
    height: 34px;
    padding: 6px 12px 6px 8px;
  `}
`;

// 유틸리티 함수
const getStatusDisplay = (
  status: ConsultationStatusEnum,
  connectedUsers?: { admin: boolean; visitor: boolean },
  iconSizes?: {
    consulting?: { width?: number; height?: number };
    ready?: { width?: number; height?: number };
    end?: { width?: number; height?: number };
  }
) => {
  const defaultIconSize = { width: 24, height: 24 };

  switch (status) {
    case ConsultationStatusEnum.CONSULTING: {
      const iconProps = { ...defaultIconSize, ...iconSizes?.consulting };
      return {
        iconComponent: <ConsultingIcon {...iconProps} width={26} height={26} />,
        label: '상담중',
        message: '상담중입니다.',
      };
    }
    case ConsultationStatusEnum.END: {
      const iconProps = { ...defaultIconSize, ...iconSizes?.end };
      return {
        iconComponent: <EndIcon {...iconProps} width={24} height={24} />,
        label: '종료중',
        message: '상담이 종료중입니다.',
      };
    }
    case ConsultationStatusEnum.READY:
    default: {
      const iconProps = { ...defaultIconSize, ...iconSizes?.ready };

      // 대기중 상태의 세부 정보 표시
      const adminConnected = connectedUsers?.admin || false;
      const visitorConnected = connectedUsers?.visitor || false;

      let message = '대기중입니다.';

      if (adminConnected && !visitorConnected) {
        message = '상담사가 대기중입니다. 고객 입장 대기중...';
      } else if (!adminConnected && visitorConnected) {
        message = '고객이 대기중입니다. 상담사 입장 대기중...';
      } else if (!adminConnected && !visitorConnected) {
        message = '대기중입니다.';
      }

      return {
        iconComponent: <ReadyIcon {...iconProps} width={24} height={24} />,
        label: '대기중',
        message,
      };
    }
  }
};

// 상담실 카드 컴포넌트
const ConsultationCard: React.FC<ConsultationCardProps> = ({
  room,
  onEnterRoom,
  onEndRoom,
  onCopyInfo,
  onTimerDone,
}) => {
  const statusDisplay = getStatusDisplay(room.status, room.connectedUsers);
  const [now, setNow] = useState(() => dayjs());

  // ✅ PRD 환경에서 now를 매초 업데이트하지 않으면 타이머가 동작하지 않음
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const createdAt = parseTimeWithKST(room.createdAt);
  const consultingStartedAt = room.consultingStartedAt
    ? parseTimeWithKST(room.consultingStartedAt)
    : null;

  const isReadyOver30m =
    room.status === ConsultationStatusEnum.READY &&
    createdAt &&
    now.diff(createdAt, 'minute') >= 30;
  const isConsultingOver100m =
    room.status === ConsultationStatusEnum.CONSULTING &&
    consultingStartedAt !== null &&
    now.diff(consultingStartedAt, 'minute') >= 100;
  const canForceEnd = isReadyOver30m || isConsultingOver100m;

  // ✅ 상담 시작 시간 안정화 (무한 루프 방지, KST 고정)
  const effectiveStartTime = useMemo(() => {
    // 실제 시작 시간이 있으면 그것을 사용
    if (room.consultingStartedAt) {
      return room.consultingStartedAt;
    }

    // CONSULTING 상태이지만 시작 시간이 없으면 현재 시간 사용 (한 번만, KST 기준)
    if (room.status === ConsultationStatusEnum.CONSULTING) {
      return dayjs().tz('Asia/Seoul').toISOString();
    }

    return undefined;
  }, [room.consultingStartedAt, room.status]); // useMemo dependencies

  // 상담 시간 타이머 (각 상담실별 독립적)
  const { formattedTime: consultationTime } = useConsultationTimer({
    consultationId: room.id,
    consultingStartedAt: effectiveStartTime,
    isConsulting: room.status === ConsultationStatusEnum.CONSULTING,
    createdAt: room.createdAt,
    status: room.status,
  });

  // ✅ 서버 시간대 감지 (첫 렌더링 시에만)
  useMemo(() => {
    if (room.status === ConsultationStatusEnum.READY) {
      const createdAtStr = room.createdAt?.toString() ?? '';
      const serverEnv =
        typeof room.createdAt === 'string'
          ? detectServerTimezone(room.createdAt)
          : 'UTC';
      console.log(
        `ver3. 🌍 [${room.id}] Server Environment: ${serverEnv}, createdAt=${createdAtStr}`
      );
    }
  }, [room.id]);

  // 종료 카운트다운 타이머
  const { remainingTimeText } = useConsultationEndTimer({
    consultationId: room.id,
    status: room.status,
    endRequestedAt: room.endRequestedAt,
    onTimerDone: onTimerDone,
  });

  // 표시할 시간 텍스트 결정
  const displayTime = useMemo(() => {
    if (room.status === ConsultationStatusEnum.END) {
      // END 상태: 카운트다운 표시 (remainingTimeText가 비어있으면 fallback)
      return remainingTimeText || '종료 처리 중...';
    } else {
      // READY/CONSULTING 상태: 경과 시간 표시
      return consultationTime;
    }
  }, [room.status, remainingTimeText, consultationTime]);

  const { isTablet } = useDeviceDetector();

  return (
    <RoomCard status={room.status}>
      <StatusBar status={room.status} />
      <CardContent>
        <CardHeader>
          <RoomNumberBadge>
            <RoomNumber>{room.id}</RoomNumber>
            <Separator />
            <RoomCode>#{room.consultationCode}</RoomCode>
          </RoomNumberBadge>
          <StatusSection>
            <StatusInfo status={room.status}>
              <StatusTime>{displayTime}</StatusTime>
              <StatusText>{statusDisplay.message}</StatusText>
            </StatusInfo>
            <StatusBadgeMain status={room.status}>
              <StatusIcon>{statusDisplay.iconComponent}</StatusIcon>
              <StatusLabel>{statusDisplay.label}</StatusLabel>
            </StatusBadgeMain>
          </StatusSection>
        </CardHeader>

        <MainContent>
          {room.tourImageUrl ? (
            <Thumbnail
              style={{
                backgroundImage: `url('${room.tourImageUrl}')`,
              }}
            />
          ) : (
            <EmptyImage width='143px' height='143px' />
          )}
          <RoomDetails>
            <DetailInfo>
              <DetailRow>
                {/* <DetailLabel>평형 정보:</DetailLabel> */}
                <DetailValue>{room.squareMeters}㎡</DetailValue>
                <DetailSeparator />
                <EnterCodeInfo>
                  입장코드:{' '}
                  <span className='text-[#111]'>{room.enterCode}</span>
                </EnterCodeInfo>
              </DetailRow>
              <DetailRow>
                <DetailLabel>유지보수 설비 정보:</DetailLabel>
                <DetailValue>{room.facilityTitle}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>개설 시간:</DetailLabel>
                <DetailValue>
                  {parseTimeWithKST(room.createdAt).toLocaleString('ko-KR')}
                </DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>개설자:</DetailLabel>
                <DetailValue>{room.consultantName}</DetailValue>
              </DetailRow>
            </DetailInfo>

            <ActionsRow>
              <CopyButton onClick={() => onCopyInfo(room)}>
                <CopyIconBox>
                  <CopyIcon width={16} height={16} />
                </CopyIconBox>
                입장 정보 복사
              </CopyButton>
              <ActionButtons>
                <ActionButton
                  variant='danger'
                  disabled={
                    (room.status !== ConsultationStatusEnum.READY &&
                      room.status !== ConsultationStatusEnum.CONSULTING) ||
                    room.connectedUsers?.visitor
                  }
                  onClick={() => onEndRoom(room.id)}
                >
                  {canForceEnd
                    ? '강제 종료'
                    : `상담 종료${isTablet ? '' : '하기'}`}
                </ActionButton>
                <ActionButton
                  className='text-[#0055A2]'
                  onClick={() => onEnterRoom(room.id, room.tourCdnId)}
                >
                  <EnterIcon width={20} height={20} />
                  <span className='ml-[4px]'>
                    상담실 입장{isTablet ? '' : '하기'}
                  </span>
                </ActionButton>
              </ActionButtons>
            </ActionsRow>
          </RoomDetails>
        </MainContent>
      </CardContent>
    </RoomCard>
  );
};

// 메인 상담실 목록 컴포넌트
export const ConsultationList: React.FC<ConsultationListProps> = ({
  consultationRooms,
  onEnterRoom,
  onEndRoom,
  onCopyInfo,
  onTimerDone,
}) => {
  /**
   * log 성 console.log
   */
  // useEffect(() => {
  //   console.log('consultationRooms updated:', consultationRooms);
  // }, [consultationRooms]);

  if (!consultationRooms || consultationRooms.length === 0) {
    return null;
  }

  return (
    <RoomList>
      {consultationRooms.map((room) => (
        <ConsultationCard
          key={'ConsultationCard' + room.id + room.status}
          room={room}
          onEnterRoom={onEnterRoom}
          onEndRoom={onEndRoom}
          onCopyInfo={onCopyInfo}
          onTimerDone={onTimerDone}
        />
      ))}
    </RoomList>
  );
};
