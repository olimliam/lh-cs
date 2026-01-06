import { useTourNavigationStore, WS_TOPIC } from '@/features';
import { useProfile } from '@/features/auth';
import useIOClient from '@/features/drawer/model/use-io-client';
import { TourViewer } from '@/features/tour-viewer/ui/tour-viewer';
import {
  useViewportSyncStore,
  // SynchronizedTourViewer,
} from '@/features/viewport-sync';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';
import { getRoleLabel } from '@/shared/model/user-role-permissions';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { TourGNBWidget, TourStatusBar } from '@/widgets';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { ToolbarProvider, ViewerProvider } from '@packages/traveler';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const DEFAULT_CONSULTANT = {
  name: '정현수',
  roleLabel: '상담원',
  avatar: '/images/Profile.png',
};

const TourPageContainer = styled(Box)`
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
`;

const TourViewerSection = styled(Box)`
  width: 100%;
  height: 100%;
  /* 헤더(64px)만 레이아웃에서 확보, 상태바는 오버레이 */
  padding: 64px 16px 16px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TourPage = () => {
  // URL 파라미터에서 consultationId 추출
  const { consultationId } = useParams<{ consultationId: string }>();
  const [searchParams] = useSearchParams();
  const tourCdnId = searchParams.get('tourCdnId') ?? '';
  // 사용자 프로필 정보
  const { data: profileData } = useProfile();

  const consultantName = profileData?.name ?? DEFAULT_CONSULTANT.name;
  const consultantAvatar =
    profileData?.profileImageUrl ?? DEFAULT_CONSULTANT.avatar;
  const consultantRole = profileData?.role
    ? (getRoleLabel(profileData.role) ?? DEFAULT_CONSULTANT.roleLabel)
    : DEFAULT_CONSULTANT.roleLabel;

  // Toast messages
  const toastMessages = useToastMessages();

  // 상담실 입장 상태 관리
  const [canEnterRoom, setCanEnterRoom] = useState<boolean | null>(null);
  const [isStatusCheckCompleted, setIsStatusCheckCompleted] = useState(false);

  // Viewport sync state (admin)
  const adminSyncEnabled = useViewportSyncStore((s) => s.adminSyncEnabled);
  const toggleAdminSync = useViewportSyncStore((s) => s.toggleAdminSync);
  const updateViewport = useViewportSyncStore((s) => s.updateViewport);
  const setUserConnected = useViewportSyncStore((s) => s.setUserConnected);

  // Tour navigation state
  const { setSharingMode, setIsSetSharingMode, setUserMode } =
    useTourNavigationStore();

  // 1. WebSocket 연결 (admin)
  const { isConnected, client } = useIOClient(import.meta.env.VITE_WS_URL, {
    sessionId: consultationId,
    onMessage: (message: any) => {
      // 메시지가 JSON 문자열인 경우 파싱
      let parsedMessage;
      try {
        parsedMessage =
          typeof message === 'string' ? JSON.parse(message) : message;
      } catch (error) {
        console.warn('Failed to parse message:', error);
        return;
      }

      // sessionId가 현재 상담Id와 다른 경우 무시
      if (parsedMessage.sessionId !== consultationId) {
        return;
      }

      // CHECK_MANAGER_JOIN 응답 처리
      if (parsedMessage.type === WsEmitEventsEnum.CHECK_MANAGER_JOIN) {
        if (parsedMessage.data.canJoin) {
          setCanEnterRoom(true);
          setSharingMode(true);
          setIsSetSharingMode(true);
        } else {
          setCanEnterRoom(false);

          // 입장 불가 메시지 표시
          toastMessages.showCannotEnterRoom(parsedMessage.message);

          // 3초 후 창 닫기
          setTimeout(() => {
            window.close();
          }, 3000);
        }

        setIsStatusCheckCompleted(true);
        return;
      }

      // VIEWPORT_SYNC 수신 처리
      if (parsedMessage.type === WsEmitEventsEnum.VIEWPORT_SYNC) {
        // visitor 연결 상태 업데이트
        setUserConnected(true);

        // viewport 데이터 업데이트 (device 정보도 함께 포함)
        if (parsedMessage.data.viewport && adminSyncEnabled) {
          const fullViewportData = {
            ...parsedMessage.data.viewport,
            ...(parsedMessage.data.device && {
              device: parsedMessage.data.device,
            }), // device 정보가 있을 때만 추가
            userId: parsedMessage.data.userId,
            consultationCode: '', // 기본값
          };

          updateViewport(fullViewportData);
        }
        return;
      }
    },
  });

  // 컴포넌트 초기화 시 userMode를 ADMIN으로 설정
  useEffect(() => {
    setUserMode(UserRoleEnum.ADMIN);
  }, [setUserMode]);

  // 2. 웹소켓 연결 후 상담실 상태 체크
  useEffect(() => {
    if (
      isConnected &&
      consultationId &&
      client &&
      profileData &&
      !isStatusCheckCompleted
    ) {
      const checkManagerJoinMessage = JSON.stringify({
        type: WsEmitEventsEnum.CHECK_MANAGER_JOIN,
        data: {
          consultationId,
          managerId: profileData.id,
          userType: UserRoleEnum.ADMIN,
        },
        sessionId: consultationId,
      });

      // 먼저 상담실 입장 가능 여부 체크
      client.emit(WS_TOPIC, checkManagerJoinMessage);
    }
  }, [
    isConnected,
    consultationId,
    client,
    profileData,
    isStatusCheckCompleted,
  ]);

  // 컴포넌트 언마운트 시 연결 해제 상태 전송 및 sharing mode 비활성화
  useEffect(() => {
    const sendDisconnectionMessage = () => {
      if (client && consultationId && profileData) {
        const disconnectionMessage = JSON.stringify({
          type: WsEmitEventsEnum.MANAGER_END,
          data: {
            consultationId,
            managerId: profileData.id,
            userType: UserRoleEnum.ADMIN,
          },
          sessionId: consultationId,
        });

        client.emit(WS_TOPIC, disconnectionMessage);

        // ADMIN 이탈 시 isSetSharingMode false로 설정
        setIsSetSharingMode(false);
      }
    };

    // window.close 호출 시 이벤트 리스너 추가
    window.addEventListener('beforeunload', sendDisconnectionMessage);

    return () => {
      window.removeEventListener('beforeunload', sendDisconnectionMessage);
      // 컴포넌트 언마운트 시에도 같은 함수 호출
      sendDisconnectionMessage();
    };
  }, [client, consultationId, profileData, setIsSetSharingMode]);

  // Consultation status (stub – integrate with backend later)
  const [consultationStatus] = useState<ConsultationStatusEnum>(
    ConsultationStatusEnum.CONSULTING
  );

  const handleScreenSyncToggle = () => {
    toggleAdminSync();
  };

  return (
    <TourPageContainer>
      {/* Tour GNB 헤더 */}
      <TourGNBWidget
        consultantName={consultantName}
        consultantAvatar={consultantAvatar}
        consultantRole={consultantRole}
        userRole={UserRoleEnum.ADMIN}
      />

      {/* Tour Status Bar - 헤더 아래 */}
      <TourStatusBar
        connectionStatus={adminSyncEnabled ? 'ON' : 'OFF'}
        onConnectionToggle={handleScreenSyncToggle}
        consultationStatus={consultationStatus}
      />

      {/* 메인 투어 뷰어 영역 */}
      <TourViewerSection>
        {!isStatusCheckCompleted || canEnterRoom === null ? (
          // 상담실 상태 체크 중 로딩 화면
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            minHeight='400px'
          >
            <Box mb={2} fontSize='18px' fontWeight='500'>
              상담실 입장 가능 여부를 확인하고 있습니다...
            </Box>
            <Box fontSize='14px' color='#666'>
              잠시만 기다려주세요.
            </Box>
          </Box>
        ) : canEnterRoom ? (
          // 입장 허가된 경우 투어 뷰어 표시 (viewport sync 적용)
          // <SynchronizedTourViewer>
          <ViewerProvider>
            <ToolbarProvider>
              <TourViewer
                tourCdnId={tourCdnId}
                consultationId={consultationId}
              />
            </ToolbarProvider>
          </ViewerProvider>
        ) : (
          // </SynchronizedTourViewer>
          // 입장 불가한 경우 에러 화면
          <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            minHeight='400px'
          >
            <Box mb={2} fontSize='18px' fontWeight='500' color='#d32f2f'>
              상담실 입장이 불가합니다
            </Box>
            <Box fontSize='14px' color='#666' textAlign='center'>
              이미 다른 관리자가 상담중입니다.
              <br />
              잠시 후 창이 자동으로 닫힙니다.
            </Box>
          </Box>
        )}
      </TourViewerSection>
    </TourPageContainer>
  );
};
