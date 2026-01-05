import { useProfile } from '@/features/auth';
import { WS_TOPIC } from '@/features/drawer';
import useIOClient from '@/features/drawer/model/use-io-client';
import { useTourNavigationStore } from '@/features/tour-navigation';
import { SimpleTourViewer } from '@/features/tour-viewer/ui/simple-tour-viewer';
import {
  // SynchronizedTourViewer,
  useViewportSyncStore,
} from '@/features/viewport-sync';
import { ConsultationStatusEnum } from '@/shared';
import { zoomSessionApi } from '@/shared/api/api-client';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { resizeWindowToViewportData } from '@/shared/lib/utils/window-resize-utils';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { TourGNBWidget, TourStatusBar } from '@/widgets';
import { useZoomVideoSession } from '@/zoom/use-zoom-video-session';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { ToolbarProvider, ViewerProvider } from '@packages/traveler';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { sendWebSocketMessage } from '../lib/webrtc-utils';

const TourPageContainer = styled(Box)`
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
`;

const SCREEN_SHARE_BANNER_HEIGHT = 80; // Chrome 화면 공유 안내 배너(~60px)에 여유분을 더해 상단 크롭 방지

interface WebRTCHostViewerProps {
  consultationId: string;
  tourCdnId: string; // Required for SimpleTourViewer integration
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
}

export const WebRTCHostViewer: React.FC<WebRTCHostViewerProps> = ({
  consultationId,
  // tourCdnId,
  onConnectionStateChange,
  onStreamingStart,
  onStreamingEnd,
}) => {
  const [canEnterRoom, setCanEnterRoom] = useState<boolean | null>(null);
  const [isStatusCheckCompleted, setIsStatusCheckCompleted] = useState(false);

  // Visitor 접속 알림 상태
  const [, setPendingVisitors] = useState<string[]>([]);

  const managerReadySentRef = useRef(false);
  const initialRoomInfoRequestedRef = useRef(false);
  const initialSyncRequestedRef = useRef(false);
  const zoomSessionSyncRequestedRef = useRef(false);
  const screenShareSyncRequestedRef = useRef(false);
  const userInitiatedScreenShareRef = useRef(false); // 사용자가 명시적으로 화면공유 시작했는지 추적
  const visitorStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectedVisitorIdRef = useRef<string | null>(null);
  const isSharingRef = useRef(false);
  const [isSharing, setIsSharing] = useState(false);

  const [openConsultationInfo, setOpenConsultationInfo] = useState(false);
  const [visitorConnection, setVisitorConnection] = useState<
    'connected' | 'disconnected' | 'connecting'
  >('connecting');
  const [visitorMessage, setVisitorMessage] = useState<string>('');
  const [consultingStartedAt, setConsultingStartedAt] = useState<
    string | undefined
  >(undefined);

  const {
    joined: zoomJoined,
    joining: zoomJoining,
    sessionId: zoomSessionId,
    join: joinZoom,
    leave: _leaveZoom,
    startShareScreen,
    stopShareScreen,
  } = useZoomVideoSession();

  useEffect(() => {
    if (!zoomSessionId || !consultationId) return;

    zoomSessionApi
      .logSession({
        consultationId,
        zoomSessionId,
      })
      .catch((error) => {
        console.error('Zoom 세션 로그 저장 실패', error);
      });
  }, [consultationId, zoomSessionId]);

  // Tour navigation state
  const { setSharingMode, setIsSetSharingMode, setUserMode } =
    useTourNavigationStore();

  // 컴포넌트 초기화 시 userMode를 ADMIN으로 설정
  useEffect(() => {
    setUserMode(UserRoleEnum.ADMIN);
  }, [setUserMode]);

  const toastMessages = useToastMessages();

  const [consultationStatus, setConsultationStatus] =
    useState<ConsultationStatusEnum>(ConsultationStatusEnum.READY);

  const { data: profileData } = useProfile();

  const stopZoomScreenShare = useCallback(async () => {
    if (!isSharingRef.current) {
      return;
    }

    try {
      await stopShareScreen();
    } catch (error) {
      console.error('Zoom 화면 공유 종료 실패', error);
    } finally {
      if (isSharingRef.current) {
        onStreamingEnd?.();
        onConnectionStateChange?.('disconnected');
      }
      isSharingRef.current = false;
      screenShareSyncRequestedRef.current = false;
      setIsSharing(false);
    }
  }, [onConnectionStateChange, onStreamingEnd, stopShareScreen]);

  const startZoomScreenShare = useCallback(async () => {
    if (!profileData?.id || !profileData?.name) {
      console.warn('프로필 정보가 없어 Zoom 화면 공유를 시작할 수 없습니다.');
      return;
    }

    try {
      // ✅ 이미 화면 공유 중이면 종료 후 재시작
      if (isSharingRef.current) {
        await stopZoomScreenShare();
      }

      // ✅ Zoom 세션 join (이미 join되어 있으면 skip)
      if (!zoomJoined) {
        await joinZoom({
          consultationId,
          userId: String(profileData.id),
          userName: profileData.name,
          role: 'HOST',
        });
      }

      // ✅ 화면공유 시작
      await startShareScreen();
      isSharingRef.current = true;
      setIsSharing(true);
      onStreamingStart?.();
      onConnectionStateChange?.('connected');
    } catch (error) {
      console.error('Zoom 화면 공유 시작 실패', error);
      toastMessages.showScreenShareFailed(
        error instanceof Error ? error.message : '화면 공유에 실패했습니다.'
      );
    }
  }, [
    consultationId,
    joinZoom,
    onConnectionStateChange,
    onStreamingStart,
    profileData,
    startShareScreen,
    stopZoomScreenShare,
    toastMessages,
    zoomJoined,
  ]);

  // Tour-page와 동일한 WebSocket 연결 (Visitor 접속 알림용)
  const { isConnected, client } = useIOClient(import.meta.env.VITE_WS_URL, {
    sessionId: consultationId,
    onMessage: (message: string | object) => {
      let parsedMessage;
      try {
        parsedMessage =
          typeof message === 'string' ? JSON.parse(message) : message;
      } catch (error) {
        console.warn('Failed to parse message:', error);
        return;
      }

      // sessionId가 현재 상담Id와 다른 경우 무시
      // 타입 변환을 고려한 비교 (문자열 vs 숫자)
      const receivedSessionId = String(parsedMessage.sessionId);
      const currentConsultationId = String(consultationId);

      if (receivedSessionId !== currentConsultationId) {
        console.warn('🚫 [DEBUG] SessionId mismatch - ignoring message:', {
          receivedSessionId: receivedSessionId,
          expectedConsultationId: currentConsultationId,
          receivedType: typeof parsedMessage.sessionId,
          expectedType: typeof consultationId,
        });
        return;
      }
      // VISITOR_READY 이벤트 수신 시 알림
      if (parsedMessage.type === WsEmitEventsEnum.VISITOR_READY) {
        const visitorId =
          parsedMessage.data.visitorId || `visitor-${Date.now()}`;

        setConsultationStatus(ConsultationStatusEnum.CONSULTING);
        setConsultingStartedAt(
          parsedMessage.data?.consultingStartedAt ?? new Date().toISOString()
        );

        connectedVisitorIdRef.current = visitorId;
        if (visitorStatusTimeoutRef.current) {
          clearTimeout(visitorStatusTimeoutRef.current);
          visitorStatusTimeoutRef.current = null;
        }
        setVisitorConnection('connected');
        setVisitorMessage('');
        setUserConnected(true);

        // Visitor ID 추가
        setPendingVisitors((prev) => [...prev, visitorId]);

        // ✅ 변경: Visitor 접속 시 자동 화면공유 제거
        // 사용자가 "화면 동기화" 버튼을 명시적으로 클릭할 때만 화면공유 시작

        if (!initialSyncRequestedRef.current) {
          requestViewportSyncFromVisitor();
          initialSyncRequestedRef.current = true;
        }
      }

      if (parsedMessage.type === WsEmitEventsEnum.VISITOR_END) {
        setConsultationStatus(parsedMessage.data.status);
        setConsultingStartedAt(undefined);
        setVisitorConnection('disconnected');
        setVisitorMessage('사용자 연결 끊김');
        initialSyncRequestedRef.current = false;
        connectedVisitorIdRef.current = null;
        stopZoomScreenShare().catch((error) =>
          console.error('Zoom 화면 공유 종료 실패', error)
        );
      }

      if (parsedMessage.type === WsEmitEventsEnum.CHECK_MANAGER_JOIN) {
        const nextStatus =
          parsedMessage.data?.status ?? ConsultationStatusEnum.READY;
        setConsultationStatus(nextStatus);
        if (parsedMessage.data.canJoin) {
          setCanEnterRoom(true);
          setSharingMode(true);
          setIsSetSharingMode(true);
          managerReadySentRef.current = false;
          if (
            (nextStatus === ConsultationStatusEnum.CONSULTING ||
              parsedMessage.data?.visitorId) &&
            !initialSyncRequestedRef.current
          ) {
            if (parsedMessage.data?.visitorId) {
              connectedVisitorIdRef.current = parsedMessage.data.visitorId;
            }
            if (visitorStatusTimeoutRef.current) {
              clearTimeout(visitorStatusTimeoutRef.current);
              visitorStatusTimeoutRef.current = null;
            }
            setVisitorConnection('connected');
            setVisitorMessage('');
            setUserConnected(true);
            requestViewportSyncFromVisitor();
            initialSyncRequestedRef.current = true;
          }
        } else {
          setCanEnterRoom(false);
          managerReadySentRef.current = false;

          // 입장 불가 메시지 표시
          toastMessages.showCannotEnterRoom(parsedMessage.message);
        }

        setIsStatusCheckCompleted(true);
        return;
      }
      if (parsedMessage.type === WsEmitEventsEnum.GET_ROOM_INFO) {
        const hasVisitor = parsedMessage.data?.hasVisitor;
        const status =
          (parsedMessage.data?.status as ConsultationStatusEnum | undefined) ??
          ConsultationStatusEnum.READY;

        setConsultationStatus(status);
        if (hasVisitor) {
          if (parsedMessage.data?.visitorId) {
            connectedVisitorIdRef.current = parsedMessage.data.visitorId;
          }
          if (visitorStatusTimeoutRef.current) {
            clearTimeout(visitorStatusTimeoutRef.current);
            visitorStatusTimeoutRef.current = null;
          }
          setVisitorConnection('connected');
          setVisitorMessage('');
          setUserConnected(true);
          if (!initialSyncRequestedRef.current) {
            requestViewportSyncFromVisitor();
            initialSyncRequestedRef.current = true;
          }
        } else {
          setVisitorConnection('disconnected');
          setUserConnected(false);
          connectedVisitorIdRef.current = null;
          initialSyncRequestedRef.current = false;
        }

        return;
      }
      // VIEWPORT_SYNC 수신 처리
      if (parsedMessage.type === WsEmitEventsEnum.VIEWPORT_SYNC) {
        // visitor 연결 상태 업데이트
        setUserConnected(true);
        setVisitorConnection('connected');
        setVisitorMessage('');
        if (visitorStatusTimeoutRef.current) {
          clearTimeout(visitorStatusTimeoutRef.current);
          visitorStatusTimeoutRef.current = null;
        }
        if (parsedMessage.data?.userId) {
          connectedVisitorIdRef.current = parsedMessage.data.userId as string;
        }
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
      // 사용자 연결 상태(Visitor) 갱신
      if (parsedMessage.type === WsEmitEventsEnum.USER_PRESENCE) {
        const status = parsedMessage.data?.status;
        const incomingVisitorId: string | undefined =
          parsedMessage.data?.visitorId;
        const isSameVisitor =
          !connectedVisitorIdRef.current ||
          !incomingVisitorId ||
          connectedVisitorIdRef.current === incomingVisitorId;

        if (status === 'disconnected') {
          if (!isSameVisitor) {
            return;
          }

          if (visitorStatusTimeoutRef.current) {
            clearTimeout(visitorStatusTimeoutRef.current);
          }

          visitorStatusTimeoutRef.current = setTimeout(() => {
            setVisitorConnection('disconnected');
            setVisitorMessage('사용자 연결 끊김');
            setUserConnected(false);
            // 상담사는 연결 유지 중이므로 상담 상태는 대기로 전환
            setConsultationStatus(ConsultationStatusEnum.READY);
            setConsultingStartedAt(undefined);
            initialSyncRequestedRef.current = false;
            connectedVisitorIdRef.current = null;
          }, 5000);
        } else if (status === 'connected') {
          if (visitorStatusTimeoutRef.current) {
            clearTimeout(visitorStatusTimeoutRef.current);
            visitorStatusTimeoutRef.current = null;
          }
          if (incomingVisitorId) {
            connectedVisitorIdRef.current = incomingVisitorId;
          }
          setVisitorConnection('connected');
          setVisitorMessage('');
          setUserConnected(true);
        }
      }
    },
  });

  useEffect(() => {
    managerReadySentRef.current = false;
    initialRoomInfoRequestedRef.current = false;
    initialSyncRequestedRef.current = false;
    zoomSessionSyncRequestedRef.current = false;
    screenShareSyncRequestedRef.current = false;
  }, [consultationId]);

  useEffect(() => {
    if (
      canEnterRoom &&
      client &&
      profileData?.id &&
      !managerReadySentRef.current
    ) {
      sendWebSocketMessage(client, WS_TOPIC, {
        type: WsEmitEventsEnum.MANAGER_READY,
        data: {
          consultationId,
          managerId: profileData.id,
          userType: UserRoleEnum.ADMIN,
        },
        sessionId: consultationId,
      });

      managerReadySentRef.current = true;
    }
  }, [canEnterRoom, client, consultationId, profileData?.id]);

  useEffect(() => {
    if (!isConnected) {
      managerReadySentRef.current = false;
      initialRoomInfoRequestedRef.current = false;
      initialSyncRequestedRef.current = false;
      zoomSessionSyncRequestedRef.current = false;
      screenShareSyncRequestedRef.current = false;
    }
  }, [isConnected]);

  // 상담 상태 변경 시 부모 창(consultation-container)으로 동기화
  useEffect(() => {
    if (typeof window === 'undefined' || !window.opener) return;

    const message = {
      type: 'CONSULTATION_STATUS_SYNC',
      data: {
        consultationId,
        status: consultationStatus,
        managerId: profileData?.id,
        visitorConnected: visitorConnection === 'connected',
        visitorId: visitorConnection === 'connected' ? 'visitor' : undefined,
        consultingStartedAt:
          consultationStatus === ConsultationStatusEnum.CONSULTING
            ? (consultingStartedAt ?? new Date().toISOString())
            : undefined,
      },
    };

    window.opener.postMessage(message, window.location.origin);
  }, [
    consultationId,
    consultationStatus,
    consultingStartedAt,
    profileData?.id,
    visitorConnection,
  ]);
  // 웹소켓 연결 후 상담실 상태 체크
  useEffect(() => {
    if (
      isConnected &&
      consultationId &&
      client &&
      profileData &&
      !isStatusCheckCompleted
    ) {
      sendWebSocketMessage(client, WS_TOPIC, {
        type: WsEmitEventsEnum.CHECK_MANAGER_JOIN,
        data: {
          consultationId,
          managerId: profileData.id,
          userType: UserRoleEnum.ADMIN,
        },
        sessionId: consultationId,
      });
    }
  }, [
    isConnected,
    consultationId,
    client,
    profileData,
    isStatusCheckCompleted,
  ]);

  useEffect(() => {
    if (
      !isConnected ||
      !consultationId ||
      !client ||
      !isStatusCheckCompleted ||
      !canEnterRoom ||
      initialRoomInfoRequestedRef.current
    ) {
      return;
    }

    sendWebSocketMessage(client, WS_TOPIC, {
      type: WsEmitEventsEnum.GET_ROOM_INFO,
      data: {
        consultationId,
      },
      sessionId: consultationId,
    });

    initialRoomInfoRequestedRef.current = true;
  }, [
    isConnected,
    consultationId,
    client,
    isStatusCheckCompleted,
    canEnterRoom,
  ]);

  const requestViewportSyncFromVisitor = useCallback(() => {
    if (!client || !consultationId || !profileData?.id) {
      return;
    }

    sendWebSocketMessage(client, WS_TOPIC, {
      type: WsEmitEventsEnum.VIEWPORT_SYNC,
      data: {
        consultationId,
        managerId: profileData.id,
        userType: UserRoleEnum.ADMIN,
        syncMode: 'request',
        userId: profileData.id,
        userRole: UserRoleEnum.ADMIN,
        timestamp: Date.now(),
      },
      sessionId: consultationId,
    });
  }, [client, consultationId, profileData?.id]);

  useEffect(() => {
    if (!zoomJoined) {
      zoomSessionSyncRequestedRef.current = false;
      return;
    }

    if (
      isConnected &&
      client &&
      consultationId &&
      canEnterRoom &&
      !zoomSessionSyncRequestedRef.current
    ) {
      requestViewportSyncFromVisitor();
      zoomSessionSyncRequestedRef.current = true;
    }
  }, [
    canEnterRoom,
    client,
    consultationId,
    isConnected,
    requestViewportSyncFromVisitor,
    zoomJoined,
  ]);

  // 재송출 버튼 핸들러 (새로운 Visitor를 위한)
  const handleReOffer = useCallback(async () => {
    try {
      console.log('🔄 Re-offer -> Zoom 화면 공유 재시작');
      userInitiatedScreenShareRef.current = true; // ✅ 사용자가 명시적으로 시작

      await startZoomScreenShare();
      requestViewportSyncFromVisitor();
      setPendingVisitors([]);
    } catch (error) {
      console.error('❌ Re-offer failed:', error);
      alert('재송출에 실패했습니다. 다시 시도해주세요.');
    }
  }, [requestViewportSyncFromVisitor, startZoomScreenShare]);

  const adminSyncEnabled = useViewportSyncStore((s) => s.adminSyncEnabled);
  const toggleAdminSync = useViewportSyncStore((s) => s.toggleAdminSync);
  const updateViewport = useViewportSyncStore((s) => s.updateViewport);
  const setUserConnected = useViewportSyncStore((s) => s.setUserConnected);
  const currentViewport = useViewportSyncStore((s) => s.currentViewport);

  // viewport 변경에 따른 window 크기 동적 조정
  useEffect(() => {
    if (!currentViewport || !adminSyncEnabled) return;

    const adjustWindowSize = () => {
      try {
        // viewport 데이터가 유효한지 확인
        if (!currentViewport.width || !currentViewport.height) {
          console.warn('⚠️ Invalid viewport data:', {
            width: currentViewport.width,
            height: currentViewport.height,
            deviceType: currentViewport.deviceType,
          });
          return;
        }

        // visitor의 viewport 정보를 이용해 window 크기 조정
        resizeWindowToViewportData(
          {
            width: currentViewport.width,
            height: currentViewport.height,
          },
          {
            screenSharePopupHeight: isSharing
              ? SCREEN_SHARE_BANNER_HEIGHT
              : undefined,
          }
        );

        // 화면 중앙으로 이동
        const screenWidth = window.screen.availWidth;
        const screenHeight = window.screen.availHeight;
        const windowWidth = window.outerWidth;
        const windowHeight = window.outerHeight;

        const left = (screenWidth - windowWidth) / 2;
        const top = (screenHeight - windowHeight) / 2;
        window.moveTo(Math.max(0, left), Math.max(0, top));
      } catch (error) {
        console.warn('Failed to adjust window size:', error);
      }
    };

    // 약간의 지연을 두어 viewport 변경이 완전히 처리된 후 실행
    const timeoutId = setTimeout(adjustWindowSize, 300);

    return () => clearTimeout(timeoutId);
  }, [currentViewport, adminSyncEnabled, isSharing]);

  const handleOpenModal = () => {
    console.log('client is exist!!!!!!', client, isConnected);
    sendWebSocketMessage(client, WS_TOPIC, {
      type: WsEmitEventsEnum.ZOOM_SHARE_CLICK,
      data: {},
      sessionId: consultationId,
    });
  };
  return (
    <TourPageContainer>
      <TourGNBWidget
        consultantName={profileData?.name || '상담원'}
        consultantAvatar={profileData?.profileImageUrl}
        userRole={UserRoleEnum.ADMIN}
        onReOffer={handleReOffer}
        isScreenSyncEnabled={true}
        isScreenSyncLoading={zoomJoining}
        toggleConsultationInfo={() =>
          setOpenConsultationInfo(!openConsultationInfo)
        }
        onOpenModal={() => handleOpenModal()}
      />

      {/* Tour Status Bar - 헤더 아래 */}
      <TourStatusBar
        connectionStatus={adminSyncEnabled ? 'ON' : 'OFF'}
        onConnectionToggle={() => toggleAdminSync()}
        consultationStatus={consultationStatus}
        visitorConnection={visitorConnection}
        visitorMessage={visitorMessage}
      />

      <>
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
              <SimpleTourViewer
                profileData={profileData}
                // tourCdnId={tourCdnId}
                consultationId={consultationId}
                openConsultationInfo={openConsultationInfo}
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
      </>
    </TourPageContainer>
  );
};
