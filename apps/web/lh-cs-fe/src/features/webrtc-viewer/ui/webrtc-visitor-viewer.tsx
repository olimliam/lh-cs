import { WS_TOPIC } from '@/features';
import useIOClient from '@/features/drawer/model/use-io-client';
import {
  useConsultationVisitorInfo,
  useVisitorAuth,
} from '@/features/visitor-auth';
import { ViewportDetector } from '@/features/viewport-sync/lib/viewport-detector';
import { ViewportData } from '@/features/viewport-sync/model/viewport-sync.types';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { VisitorTourGuard } from '@/shared/ui';
import styled from '@emotion/styled';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { VisitorToolBar } from '@/features/webrtc-viewer/ui/visitor-tool-bar';
import { useSearchParams } from 'react-router-dom';
import { useZoomVideoSession } from '@/zoom/use-zoom-video-session';

const TourPageContainer = styled(Box)`
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
  overflow: hidden;
`;

interface WebRTCVisitorViewerProps {
  consultationId: string;
  placeholder?: string;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  onStreamReceived?: (stream?: MediaStream) => void;
  onStreamEnded?: () => void;
}

export const WebRTCVisitorViewer: React.FC<WebRTCVisitorViewerProps> = ({
  consultationId,
  placeholder,
  onConnectionStateChange,
  onStreamReceived,
  onStreamEnded,
}) => {
  // 상태
  const [error, setError] = useState<string>('');
  const [isWaitingForHost, setIsWaitingForHost] = useState(true);
  const shareCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousShareActiveRef = useRef(false);

  // visitorId 상태 (기존 visitor-tour-page 방식과 동일)
  const [visitorId, setVisitorId] = useState<string>('');

  // Viewport sync
  const viewportDetectorRef = useRef<ViewportDetector | null>(null);
  const preAuthViewportSharedRef = useRef(false);
  const hostReadyViewportSharedRef = useRef(false);
  const zoomViewportSharedRef = useRef(false);

  // 상담 ID를 기반으로 visitor ID 조회 (기존 방식과 동일)
  const { data: consultationVisitorInfo } = useConsultationVisitorInfo(
    consultationId || '',
    { enabled: !!consultationId }
  );

  const {
    joined: zoomJoined,
    error: zoomError,
    join: joinZoom,
    leave: leaveZoom,
    bindShareViewTarget,
    shareActive,
  } = useZoomVideoSession();

  const [isStatusCheckCompleted, setIsStatusCheckCompleted] = useState(false);
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);

  const setShareCanvasRef = useCallback(
    (el: HTMLCanvasElement | null) => {
      shareCanvasRef.current = el;
      if (el) {
        console.log('[VISITOR] bindShareViewTarget', el);
        bindShareViewTarget(el);
      }
    },
    [bindShareViewTarget]
  );

  useEffect(() => {
    console.log(shareActive ? '✅ 화면 공유 수신 중' : '⏳ 화면 공유 대기 중');

    if (shareActive) {
      setError('');
      setIsWaitingForHost(false);
      onConnectionStateChange?.('connected');
      onStreamReceived?.();
    } else {
      setIsWaitingForHost(true);
      if (previousShareActiveRef.current) {
        onStreamEnded?.();
        onConnectionStateChange?.('disconnected');
      }
    }
    previousShareActiveRef.current = shareActive;
  }, [onConnectionStateChange, onStreamEnded, onStreamReceived, shareActive]);

  const handleSyncViewport = async () => {
    try {
      if (!viewportDetectorRef.current) {
        viewportDetectorRef.current = new ViewportDetector();
      }

      const currentViewport =
        await viewportDetectorRef.current.getCurrentViewport();

      const updatedViewport = {
        ...currentViewport,
        userId: visitorId,
        consultationCode: consultationId || '',
      };

      sendViewportSync(updatedViewport, 'update');
    } catch (err) {
      console.warn('Failed to sync viewport:', err);
      return;
    }
  };

  // Tour-page와 동일한 WebSocket 연결 (Host 알림용)
  const { isConnected: isWebSocketConnected, client } = useIOClient(
    import.meta.env.VITE_WS_URL,
    {
      sessionId: consultationId,
      onMessage: async (message: string | object) => {
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
              setIsStatusCheckCompleted(true);
            } else {
              setIsStatusCheckCompleted(false);
              hostReadyViewportSharedRef.current = false;
            }
          }

          if (parsedMessage.type === WsEmitEventsEnum.MANAGER_END) {
            setError('상담이 종료되었습니다.');
            setIsWaitingForHost(true);
            setIsStatusCheckCompleted(false);
            hostReadyViewportSharedRef.current = false;
            preAuthViewportSharedRef.current = false;
            leaveZoom();
          }

          // 화면 동기화 요청 수신 시 현재 뷰포트 전송
          if (
            parsedMessage.type === WsEmitEventsEnum.VIEWPORT_SYNC &&
            parsedMessage.data?.syncMode === 'request'
          ) {
            await handleSyncViewport();
          }

          if (parsedMessage.type === WsEmitEventsEnum.ZOOM_SHARE_CLICK) {
            await handleSyncViewport();
          }
        } catch (error) {
          console.warn('Failed to parse message:', error);
          return;
        }
      },
    }
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

  // consultationVisitorInfo가 있으면 사용, 없으면 localStorage에서 확인 (서버에서 생성)
  useEffect(() => {
    if (consultationVisitorInfo?.visitorId) {
      // 상담에서 조회된 visitorId 사용 (최우선)
      setVisitorId(consultationVisitorInfo.visitorId);
    } else if (!visitorId && consultationId) {
      // visitorId가 없으면 localStorage에서 확인 (서버에서 생성된 ID만 사용)
      const storedVisitorId = localStorage.getItem('visitorId');
      if (storedVisitorId) {
        setVisitorId(storedVisitorId);
      }
      // 서버에서 생성되므로 클라이언트에서는 생성하지 않음
    }
  }, [consultationVisitorInfo, consultationId, visitorId]);

  // Host에게 VISITOR_READY 알림 전송 (중복 방지)
  const visitorReadySentRef = useRef(false);
  const sendVisitorReady = useCallback(() => {
    if (
      isWebSocketConnected &&
      client &&
      consultationId &&
      visitorId &&
      !visitorReadySentRef.current
    ) {
      const visitorReadyMessage = JSON.stringify({
        type: WsEmitEventsEnum.VISITOR_READY,
        data: {
          consultationId,
          visitorId: visitorId,
          userType: UserRoleEnum.VISITOR,
        },
        sessionId: consultationId,
      });

      client.emit(WS_TOPIC, visitorReadyMessage);
      visitorReadySentRef.current = true;
      console.log('🔔 VISITOR_READY sent to Host:', visitorId);
    }
  }, [isWebSocketConnected, client, consultationId, visitorId]);

  useEffect(() => {
    visitorReadySentRef.current = false;
    preAuthViewportSharedRef.current = false;
    hostReadyViewportSharedRef.current = false;
    zoomViewportSharedRef.current = false;
  }, [consultationId]);

  useEffect(() => {
    if (!isWebSocketConnected) {
      preAuthViewportSharedRef.current = false;
      hostReadyViewportSharedRef.current = false;
      zoomViewportSharedRef.current = false;
    }
  }, [isWebSocketConnected]);

  // Viewport 정보 전송 함수 (카메라 정보 제외)
  const sendViewportSync = useCallback(
    (
      viewport: ViewportData,
      syncMode: 'update' | 'request' = 'update',
      overrideVisitorId?: string
    ) => {
      const resolvedVisitorId = overrideVisitorId ?? visitorId;

      if (!client || !consultationId || !resolvedVisitorId) {
        console.warn(
          '⚠️ [sendViewportSync] Cannot send - missing requirements:',
          {
            client: !!client,
            consultationId: consultationId,
            visitorId: resolvedVisitorId,
            clientConnected: client?.connected,
          }
        );
        return;
      }

      if (!client.connected) {
        console.warn('⚠️ [sendViewportSync] Client not connected');
        return;
      }

      const viewportSyncMessage = JSON.stringify({
        type: WsEmitEventsEnum.VIEWPORT_SYNC,
        data: {
          consultationId,
          visitorId: resolvedVisitorId,
          userType: UserRoleEnum.VISITOR,
          viewport: viewport,
          syncMode,
          userId: resolvedVisitorId,
          userRole: UserRoleEnum.VISITOR,
          timestamp: Date.now(),
        },
        sessionId: consultationId,
      });

      client.emit(WS_TOPIC, viewportSyncMessage);
      console.log('✅ [sendViewportSync] Message sent successfully');
    },
    [client, consultationId, visitorId]
  );

  const shareCurrentViewport = useCallback(
    async (reason: string, overrideVisitorId?: string) => {
      const targetVisitorId = overrideVisitorId ?? visitorId;

      if (!client || !consultationId || !targetVisitorId) {
        return;
      }

      try {
        if (!viewportDetectorRef.current) {
          viewportDetectorRef.current = new ViewportDetector();
        }

        const currentViewport =
          await viewportDetectorRef.current.getCurrentViewport();

        const updatedViewport = {
          ...currentViewport,
          userId: targetVisitorId,
          consultationCode: consultationId || '',
        };

        sendViewportSync(updatedViewport, 'update', targetVisitorId);
        console.log(`📨 [ViewportSync] Sent (${reason})`);
      } catch (err) {
        console.warn(`⚠️ [ViewportSync] Failed to send (${reason}):`, err);
      }
    },
    [client, consultationId, sendViewportSync, visitorId]
  );

  // 사용자 연결 상태 알림
  const sendUserPresence = useCallback(
    (status: 'connected' | 'disconnected', reason?: string) => {
      if (!client || !consultationId || !visitorId) {
        return;
      }

      const presenceMessage = JSON.stringify({
        type: WsEmitEventsEnum.USER_PRESENCE,
        data: {
          consultationId,
          visitorId: visitorId,
          userType: UserRoleEnum.VISITOR,
          status,
          reason,
          timestamp: Date.now(),
        },
        sessionId: consultationId,
      });

      client.emit(WS_TOPIC, presenceMessage);
    },
    [client, consultationId, visitorId]
  );

  // Zoom 세션 조인 여부 기준 presence 전송
  useEffect(() => {
    if (!isWebSocketConnected || !client || !visitorId || !consultationId) {
      return;
    }

    if (zoomJoined) {
      sendUserPresence('connected');
    }
  }, [
    client,
    consultationId,
    isWebSocketConnected,
    sendUserPresence,
    visitorId,
    zoomJoined,
  ]);

  useEffect(() => {
    sendVisitorReady();
  }, [sendVisitorReady]);

  useEffect(() => {
    if (!isStatusCheckCompleted) {
      hostReadyViewportSharedRef.current = false;
    }
  }, [isStatusCheckCompleted]);

  useEffect(() => {
    if (
      isWebSocketConnected &&
      client &&
      consultationId &&
      visitorId &&
      !isCodeSubmitted &&
      !preAuthViewportSharedRef.current
    ) {
      preAuthViewportSharedRef.current = true;
      shareCurrentViewport('pre-auth');
    }
  }, [
    client,
    consultationId,
    isCodeSubmitted,
    isWebSocketConnected,
    shareCurrentViewport,
    visitorId,
  ]);

  useEffect(() => {
    if (
      isStatusCheckCompleted &&
      isWebSocketConnected &&
      consultationId &&
      visitorId &&
      !hostReadyViewportSharedRef.current
    ) {
      hostReadyViewportSharedRef.current = true;
      shareCurrentViewport('host-ready');
    }
  }, [
    consultationId,
    isStatusCheckCompleted,
    isWebSocketConnected,
    shareCurrentViewport,
    visitorId,
  ]);

  useEffect(() => {
    if (!zoomJoined) {
      zoomViewportSharedRef.current = false;
      return;
    }

    if (
      isWebSocketConnected &&
      client &&
      consultationId &&
      visitorId &&
      !zoomViewportSharedRef.current
    ) {
      zoomViewportSharedRef.current = true;
      shareCurrentViewport('zoom-joined');
    }
  }, [
    client,
    consultationId,
    isWebSocketConnected,
    shareCurrentViewport,
    visitorId,
    zoomJoined,
  ]);

  // 컴포넌트 언마운트 시 연결 해제 상태 전송
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
        console.log('🔥 [DEBUG] Visitor VISITOR_END message sent to server');
      }

      sendUserPresence('disconnected', 'visitor-unload');
      leaveZoom();
    };

    // window.close 호출 시 이벤트 리스너 추가
    window.addEventListener('beforeunload', sendDisconnectionMessage);

    return () => {
      window.removeEventListener('beforeunload', sendDisconnectionMessage);
      // 컴포넌트 언마운트 시에도 같은 함수 호출
      sendDisconnectionMessage();
    };
  }, [client, consultationId, leaveZoom, sendUserPresence, visitorId]);

  // Viewport 감지기 초기화
  useEffect(() => {
    if (!viewportDetectorRef.current) {
      viewportDetectorRef.current = new ViewportDetector();
    }

    // viewport 변경 콜백 등록 (visitorId와 consultationId가 변경될 때마다 재등록)
    if (viewportDetectorRef.current && visitorId && consultationId) {
      viewportDetectorRef.current.onViewportChange((viewport: ViewportData) => {
        // userId와 consultationCode 업데이트
        const updatedViewport = {
          ...viewport,
          userId: visitorId,
          consultationCode: consultationId || '',
        };

        sendViewportSync(updatedViewport);
      });
    }

    return () => {
      if (viewportDetectorRef.current) {
        viewportDetectorRef.current.destroy();
        viewportDetectorRef.current = null;
      }
    };
  }, [sendViewportSync, visitorId, consultationId]);

  const {
    mutateAsync: authenticateVisitor,
    isPending: isLoading,
    isSuccess,
  } = useVisitorAuth();
  const toastMessages = useToastMessages();

  // 비밀번호 입력시 처리 함수 (기존 visitor-tour-page 방식과 동일)
  const handleEnterCodeSubmit = async (enterCode: string) => {
    try {
      const response = await authenticateVisitor({
        visitorId,
        enterCode,
        consultationId, // 상담실 ID 추가
      });

      if (response.success) {
        // 만약 이전 visitorId 가 있다면 그것을 유지
        if (response.visitorId) {
          setVisitorId(response.visitorId);
          localStorage.setItem('visitorId', response.visitorId);
        }

        // ✅ Zoom Video SDK 세션 join (GUEST)
        const finalVisitorId = response.visitorId ?? visitorId;
        if (!zoomJoined && finalVisitorId) {
          await joinZoom({
            consultationId,
            userId: finalVisitorId,
            userName: '방문자', // 필요 시 실제 이름으로 교체
            role: 'GUEST',
          });
        }
      }

      const checkVisitorJoinMessage = JSON.stringify({
        type: WsEmitEventsEnum.VISITOR_READY,
        data: {
          consultationId,
          visitorId: response.visitorId ?? visitorId,
          userType: UserRoleEnum.VISITOR,
        },
        sessionId: consultationId,
      });

      // 먼저 상담실 입장 가능 여부 체크
      client?.emit(WS_TOPIC, checkVisitorJoinMessage);
      visitorReadySentRef.current = true;

      await shareCurrentViewport(
        'post-auth-submit',
        response.visitorId ?? visitorId
      );
      setIsCodeSubmitted(true);
    } catch (error) {
      console.error('Authentication failed:', error);

      // 토스트 메시지로 사용자에게 알림
      toastMessages.showAuthFailed(
        '입장 코드가 올바르지 않습니다. 다시 확인해주세요.'
      );

      setIsCodeSubmitted(false);
    }
  };

  const [searchParams] = useSearchParams();
  const tourCdnId = searchParams.get('tourCdnId') ?? '';

  const placeholderMessage =
    placeholder ||
    zoomError ||
    error ||
    (isWaitingForHost ? 'Host의 화면 공유를 기다리는 중...' : '연결 중...');

  const handleVisitorExit = useCallback(() => {
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
      sendUserPresence('disconnected', 'visitor-exit');
      setIsWaitingForHost(true);
      setError('상담을 종료했습니다.');
      leaveZoom();
    }
  }, [client, consultationId, leaveZoom, sendUserPresence, visitorId]);

  return (
    <VisitorTourGuard
      isCodeSubmitted={isCodeSubmitted}
      fallbackContainer={<TourPageContainer />}
      onEnterCodeSubmit={handleEnterCodeSubmit}
      isLoading={isLoading}
    >
      {isSuccess && (
        <TourPageContainer>
          <canvas
            ref={setShareCanvasRef}
            style={{
              width: '100%',
              height: '100%',
              background: '#000',
              display: 'block',
            }}
          />
          {!shareActive && (
            <Box
              position='absolute'
              top={0}
              left={0}
              right={0}
              bottom={0}
              display='flex'
              alignItems='center'
              justifyContent='center'
              color='#fff'
              fontSize='16px'
              textAlign='center'
              px={2}
            >
              {placeholderMessage}
            </Box>
          )}

          <VisitorToolBar
            areaLabel='평형:'
            areaValue={
              consultationVisitorInfo?.squareMeters
                ? `${consultationVisitorInfo.squareMeters}㎡`
                : '-'
            }
            facilityLabel='시설 정보:'
            facilityValue={consultationVisitorInfo?.facilityName || '-'}
            tourCdnId={tourCdnId}
            onEndConsultationClick={handleVisitorExit}
          />
        </TourPageContainer>
      )}
    </VisitorTourGuard>
  );
};
