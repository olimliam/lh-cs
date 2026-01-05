import { WS_TOPIC } from '@/features/drawer';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { resolveWebSocketUrl } from '@/shared/lib/url/resolve-websocket-url';
// import { UserRoleEnum } from '@/shared/model/user-role.enum';

// 웹소켓 전용 상담 상태 enum (기본 상담 상태 + 웹소켓 특화 상태)
export enum WebSocketConsultationStatusEnum {
  READY = 'READY',
  CONSULTING = 'CONSULTING',
  END = 'END',
  // 웹소켓 전용 상태
  ACTIVE = 'active',
  ENDED = 'ended',
  ENDING = 'ending',
}

export interface ViewportSyncData {
  consultationId: string;
  viewport: {
    width: number;
    height: number;
    aspectRatio: number;
  };
}

export interface UserPresenceData {
  consultationId: string;
  visitorId: string;
  status: 'connected' | 'disconnected';
}

export interface ConsultationStatusData {
  consultationId: string;
  status: WebSocketConsultationStatusEnum;
  adminConnected?: boolean;
}

export interface VisitorWebSocketMessage {
  type: 'viewport-sync' | 'user-presence' | 'consultation-status';
  payload: ViewportSyncData | UserPresenceData | ConsultationStatusData;
  timestamp: string;
}

interface UseVisitorWebSocketOptions {
  visitorId: string;
  consultationId: string;
  onMessage: (message: VisitorWebSocketMessage) => void;
}

/**
 * 처리해야할 상태들
 * - viewport-sync
 * @param url
 * @param options
 * @returns
 */
export function useVisitorWebSocket(
  url: string | null,
  options: UseVisitorWebSocketOptions
) {
  const [client, setClient] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const clientRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const onMessageRef = useRef(options.onMessage);

  const topic = WS_TOPIC;

  // 메시지 전송 함수들
  const sendViewportSync = useCallback(
    (viewport: ViewportSyncData['viewport']) => {
      if (clientRef.current?.connected) {
        const message: VisitorWebSocketMessage = {
          type: 'viewport-sync',
          payload: {
            consultationId: optionsRef.current.consultationId,
            viewport,
          },
          timestamp: new Date().toISOString(),
        };
        clientRef.current.emit('visitor-message', message);
      }
    },
    []
  );

  // 연결/해제 함수들
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      return;
    }

    const targetUrl = resolveWebSocketUrl(url);
    if (!targetUrl) {
      console.warn('⚠️ Unable to resolve visitor WebSocket URL');
      return;
    }

    const instance = io(targetUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: {
        visitorId: options.visitorId,
        consultationId: options.consultationId,
        userType: 'visitor',
      },
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setClient(instance);
    clientRef.current = instance;

    // 이벤트 리스너 등록
    instance.on('connect', () => {
      console.log('🟢 Visitor WebSocket connected');
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    if (onMessageRef.current) {
      const messageHandler = (data: any) => {
        onMessageRef.current?.(data);
      };

      const topicHandler = (data: any) => {
        onMessageRef.current?.(data);
      };

      instance.on('message', messageHandler);
      instance.on(topic, topicHandler);
    }
  }, [url, options.visitorId, options.consultationId]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      // Visitor 연결 해제 상태 전송
      clientRef.current.emit(
        topic,
        JSON.stringify({
          type: WsEmitEventsEnum.VISITOR_END,
          data: {
            consultationId: optionsRef.current.consultationId,
            visitorId: optionsRef.current.visitorId,
            userType: UserRoleEnum.VISITOR,
            connected: false,
          },
          sessionId: optionsRef.current.consultationId,
        })
      );

      // 연결 해제 전 presence 알림 (기존 시스템 호환성)

      clientRef.current.close();
      clientRef.current = null;
      setClient(null);
      setIsConnected(false);
    }
  }, []);

  // 컴포넌트 마운트/언마운트 시 자동 연결/해제
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    client,
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendViewportSync,
  };
}
