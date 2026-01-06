import { WS_TOPIC } from '@/features';
import useIOClient from '@/features/drawer/model/use-io-client';
import { TourViewer } from '@/features/tour-viewer/ui/tour-viewer';
import { useTourNavigationStore } from '@/features/tour-navigation';
import {
  useVisitorAuth,
  useConsultationVisitorInfo,
} from '@/features/visitor-auth';
import { ViewportDetector } from '@/features/viewport-sync/lib/viewport-detector';
import { ViewportData } from '@/features/viewport-sync/model/viewport-sync.types';

import { ConsultationStatusEnum } from '@/shared/model/consultation.enum';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { VisitorTourGuard } from '@/shared/ui';
import { TourGNBWidget, TourStatusBar } from '@/widgets';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { ToolbarProvider, ViewerProvider } from '@packages/traveler';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';

export const VisitorTourPage = () => {
  const { setUserMode } = useTourNavigationStore();

  // URL 파라미터에서 consultationId 추출
  const { consultationId } = useParams<{
    consultationId: string;
  }>();

  const [consultantName, setConsultantName] = useState<string>('');
  const [isConsultationEnding] = useState(false);
  const [isConsultationEnded] = useState(false);
  const [consultationStatus, setConsultationStatus] =
    useState<ConsultationStatusEnum>(ConsultationStatusEnum.READY);
  const [isAdminConnected, setIsAdminConnected] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const tourCdnId = searchParams.get('tourCdnId') ?? '';

  // 상담 ID를 기반으로 visitor ID 조회
  const { data: consultationVisitorInfo } = useConsultationVisitorInfo(
    consultationId || '',
    { enabled: !!consultationId }
  );

  // visitorId 상태 (상담 기반 ID 또는 새로 생성된 ID)
  const [visitorId, setVisitorId] = useState<string>('');

  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);

  // React Query for authentication
  const { mutateAsync: authenticateVisitor, isPending: isLoading } =
    useVisitorAuth();

  // Viewport sync
  const viewportDetectorRef = useRef<ViewportDetector | null>(null);

  // 카메라 정보 상태
  const [currentCamera, setCurrentCamera] = useState<{
    rotation: { pitch: number; yaw: number };
    fov: number;
  } | null>(null);

  // 카메라 변경 콜백
  const handleCameraChange = useCallback(
    (camera: { rotation: { pitch: number; yaw: number }; fov: number }) => {
      setCurrentCamera(camera);
    },
    []
  );

  // 컴포넌트 초기화 시 userMode를 VISITOR로 설정
  useEffect(() => {
    setUserMode(UserRoleEnum.VISITOR);
  }, [setUserMode]);

  // consultationVisitorInfo가 있으면 사용, 없으면 새로 생성
  useEffect(() => {
    if (consultationVisitorInfo?.visitorId) {
      // 상담에서 조회된 visitorId 사용
      setVisitorId(consultationVisitorInfo.visitorId);
    }
  }, [consultationVisitorInfo, consultationId, visitorId]);

  // const { showCannotEnterRoom } = useToastMessages();
  const [isStatusCheckCompleted, setIsStatusCheckCompleted] = useState(false);

  // WebSocket 연결 (admin)
  const { isConnected: isWebSocketConnected, client } = useIOClient(
    import.meta.env.VITE_WS_URL,
    {
      sessionId: consultationId,
      onMessage: (message: string | object) => {
        let parsedMessage;
        try {
          parsedMessage =
            typeof message === 'string' ? JSON.parse(message) : message;

          if (parsedMessage.sessionId !== consultationId) {
            console.log('Session ID mismatch:', parsedMessage, consultationId);

            return;
          }

          // 입장하기 전 받는 상태
          if (parsedMessage.type === WsEmitEventsEnum.CHECK_VISITOR_JOIN) {
            if (parsedMessage.data.canJoin) {
              setIsAdminConnected(true);
              setConsultationStatus(ConsultationStatusEnum.READY);
              setIsStatusCheckCompleted(true);
            } else {
              setIsAdminConnected(false);
              setConsultationStatus(ConsultationStatusEnum.READY);
              setIsStatusCheckCompleted(false);
            }
          }
        } catch (error) {
          console.warn('Failed to parse message:', error);
          return;
        }
      },
    }
  );

  // Viewport와 카메라 정보 전송 함수
  const sendViewportSync = useCallback(
    (
      viewport: ViewportData,
      cameraInfo?: { rotation: { pitch: number; yaw: number }; fov: number }
    ) => {
      if (!client || !consultationId || !visitorId) return;

      const viewportSyncMessage = JSON.stringify({
        type: WsEmitEventsEnum.VIEWPORT_SYNC,
        data: {
          consultationId,
          visitorId: visitorId,
          userType: UserRoleEnum.VISITOR,
          viewport: viewport,
          camera: cameraInfo,
          syncMode: 'update',
          userId: visitorId,
          userRole: UserRoleEnum.VISITOR,
          timestamp: Date.now(),
        },
        sessionId: consultationId,
      });

      client.emit(WS_TOPIC, viewportSyncMessage);
    },
    [client, consultationId, visitorId]
  );

  // 웹소켓 연결 후 상담실 상태 체크
  useEffect(() => {
    if (
      isWebSocketConnected &&
      consultationId &&
      client &&
      !isStatusCheckCompleted
    ) {
      const checkVisitorJoinMessage = JSON.stringify({
        type: WsEmitEventsEnum.CHECK_VISITOR_JOIN,
        data: {
          consultationId,
          visitorId: visitorId,
          userType: UserRoleEnum.VISITOR,
        },
        sessionId: consultationId,
      });

      // 먼저 상담실 입장 가능 여부 체크
      client.emit(WS_TOPIC, checkVisitorJoinMessage);
    }
  }, [
    isWebSocketConnected,
    consultationId,
    client,
    isStatusCheckCompleted,
    visitorId,
  ]);

  // 컴포넌트 언마운트 시 연결 해제 상태 전송 및 sharing mode 비활성화
  useEffect(() => {
    const sendDisconnectionMessage = () => {
      if (client && consultationId && visitorId) {
        const disconnectionMessage = JSON.stringify({
          type: WsEmitEventsEnum.VISITOR_END,
          data: {
            consultationId,
            visitorId: visitorId,
            userType: UserRoleEnum.VISITOR,
          },
          sessionId: consultationId,
        });
        client.emit(WS_TOPIC, disconnectionMessage);
      }
    };
    // window.close 호출 시 이벤트 리스너 추가
    window.addEventListener('beforeunload', sendDisconnectionMessage);
    return () => {
      window.removeEventListener('beforeunload', sendDisconnectionMessage);
      // 컴포넌트 언마운트 시에도 같은 함수 호출
      sendDisconnectionMessage();
    };
  }, [client, consultationId, visitorId]);

  // Viewport 감지 및 전송 설정
  useEffect(() => {
    if (!isCodeSubmitted || !client || !consultationId || !visitorId) return;

    // ViewportDetector 초기화
    if (!viewportDetectorRef.current) {
      viewportDetectorRef.current = new ViewportDetector();
    }

    const detector = viewportDetectorRef.current;

    // viewport 변경 시 전송
    detector.onViewportChange((viewport) => {
      sendViewportSync(viewport, currentCamera || undefined);
    });

    // 초기 viewport 전송
    const sendInitialViewport = async () => {
      const initialViewport = await detector.getCurrentViewport();
      sendViewportSync(initialViewport, currentCamera || undefined);
    };
    sendInitialViewport();

    return () => {
      detector.destroy();
      viewportDetectorRef.current = null;
    };
  }, [
    isCodeSubmitted,
    client,
    consultationId,
    visitorId,
    sendViewportSync,
    currentCamera,
  ]);

  // 화면 동기화 버튼 클릭 시 현재 viewport를 수동 전송
  const handleViewportSyncClick = useCallback(async () => {
    if (!client || !consultationId || !visitorId) return;

    try {
      if (!viewportDetectorRef.current) {
        viewportDetectorRef.current = new ViewportDetector();
      }

      const currentViewport =
        await viewportDetectorRef.current.getCurrentViewport();

      sendViewportSync(currentViewport, currentCamera || undefined);
    } catch (error) {
      console.warn('Failed to send manual viewport sync:', error);
    }
  }, [client, consultationId, visitorId, sendViewportSync, currentCamera]);

  const handleEnterCodeSubmit = async (enterCode: string) => {
    try {
      const response = await authenticateVisitor({
        visitorId,
        enterCode,
        consultationId: consultationId || '',
      });

      if (response.success) {
        setConsultantName(response.consultantName);

        // 만약 이전 visitorId 가 있다면 그것을 유지
        if (response.visitorId) {
          setVisitorId(response.visitorId);
          localStorage.setItem('visitorId', response.visitorId);
        }
      }

      const checkVisitorJoinMessage = JSON.stringify({
        type: WsEmitEventsEnum.VISITOR_READY,
        data: {
          consultationId,
          visitorId: visitorId,
          userType: UserRoleEnum.VISITOR,
        },
        sessionId: consultationId,
      });

      // 먼저 상담실 입장 가능 여부 체크
      client?.emit(WS_TOPIC, checkVisitorJoinMessage);

      setIsCodeSubmitted(true);
    } catch (error) {
      console.error('Authentication failed:', error);
      setIsCodeSubmitted(false);
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', function (e) {
      e.preventDefault();
    });
  }, []);

  // 투어 모드 결정: 상담 종료 후에는 ADMIN 모드 (조작 가능)
  const tourUserMode = isConsultationEnded
    ? UserRoleEnum.ADMIN
    : UserRoleEnum.VISITOR;

  return (
    <TourLayout>
      <VisitorTourGuard
        isCodeSubmitted={isCodeSubmitted}
        fallbackContainer={<TourPageContainer />}
        onEnterCodeSubmit={handleEnterCodeSubmit}
        isLoading={isLoading}
      >
        <TourPageContainer>
          {/* Tour GNB 헤더 */}
          <TourGNBWidget
            userRole={tourUserMode}
            consultantName={consultantName}
            onReOffer={handleViewportSyncClick}
          />

          <TourStatusBar
            connectionStatus={isAdminConnected ? 'ON' : 'OFF'}
            consultationStatus={consultationStatus}
          />

          {/* 연결 상태 표시 */}
          {!isWebSocketConnected ? (
            <ConnectionStatus>연결 중...</ConnectionStatus>
          ) : (
            <TourViewerSection>
              <ViewerProvider>
                <ToolbarProvider>
                  <TourViewer
                    tourCdnId={tourCdnId}
                    onCameraChange={handleCameraChange}
                    onRemoteMarkerClick={(markerId, markerType, markerContent) => {
                      console.log('handleRemoteMarkerClick!!!!!', {
                        markerId,
                        markerType,
                        markerContent,
                      });
                    }}
                  />
                </ToolbarProvider>
              </ViewerProvider>
            </TourViewerSection>
          )}

          {/* 상담 종료 알림 메시지 */}
          {isConsultationEnding && (
            <ConsultationEndingNotice>
              5분후에 상담이 종료됩니다
            </ConsultationEndingNotice>
          )}

          {/* 상담 완료 알림 메시지 */}
          {isConsultationEnded && (
            <ConsultationEndedNotice>
              상담이 종료되었습니다. 이제 자유롭게 투어를 둘러보실 수 있습니다.
            </ConsultationEndedNotice>
          )}
        </TourPageContainer>
      </VisitorTourGuard>
    </TourLayout>
  );
};

const TourLayout = styled.div`
  height: var(--vh);
`;

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

const BaseNotice = styled(Box)`
  position: fixed;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  z-index: 1100;
  backdrop-filter: blur(10px);
`;

const ConnectionStatus = styled(BaseNotice)`
  top: 80px;
  right: 20px;
  background: rgba(255, 193, 7, 0.9);
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
`;

const ConsultationEndingNotice = styled(BaseNotice)`
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(206, 46, 54, 0.95);
  color: white;
  padding: 20px 30px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  border: 2px solid #ce2e36;
  box-shadow: 0 8px 32px rgba(206, 46, 54, 0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      opacity: 0.95;
      transform: translate(-50%, -50%) scale(1);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.02);
    }
    100% {
      opacity: 0.95;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const ConsultationEndedNotice = styled(BaseNotice)`
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(76, 175, 80, 0.95);
  color: white;
  font-size: 16px;
  border: 2px solid #4caf50;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
  animation: slideDown 0.5s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
`;
