import { useEffect, useState, useCallback, useRef } from 'react';

import { io, Socket } from 'socket.io-client';
import { PublishMessage } from './whiteboard.types';
import { WS_TOPIC } from '@/shared/model/ws-const';
import { resolveWebSocketUrl } from '@/shared/lib/url/resolve-websocket-url';

export default function useIOClient(
  url: string,
  opts: { onMessage: (message: string) => void; sessionId?: string }
) {
  const [client, setClient] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const subscriptionsRef = useRef<string[]>([]);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const topic = WS_TOPIC;

  // client도 useRef로 안정적인 참조 생성
  const clientRef = useRef<Socket | null>(null);
  const onMessageRef = useRef(opts.onMessage);

  // opts.onMessage가 변경될 때마다 ref 업데이트
  onMessageRef.current = opts.onMessage;

  // useRef로 함수들의 안정적인 참조 생성
  const subscribeRef = useRef<() => void>();
  const unsubscribeRef = useRef<() => void>();

  // 함수들을 useRef에 저장하여 의존성 순환 방지
  subscribeRef.current = () => {
    if (!subscriptionsRef.current.includes(topic)) {
      subscriptionsRef.current.push(topic);
      // console.info('📡 Adding subscription to topic:', topic);
    }
    if (clientRef.current && clientRef.current.connected) {
      // console.info('📡 Subscribing to topic:', topic);
      clientRef.current.emit('subscribe', [topic]);
    }
  };

  unsubscribeRef.current = () => {
    const subscriptions = subscriptionsRef.current;
    const i = subscriptions.indexOf(topic);
    if (i !== -1) {
      subscriptions.splice(i, 1);
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.emit('unsubscribe', topic);
      }
    }
  };

  const subscribe = useCallback(() => {
    subscribeRef.current?.();
  }, []);

  const unsubscribe = useCallback(() => {
    unsubscribeRef.current?.();
  }, []);

  // publish 함수도 같은 방식으로 처리
  const publishRef = useRef<(message: PublishMessage) => void>();

  publishRef.current = (message: PublishMessage) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.emit(topic, JSON.stringify(message));
    } else {
      console.warn('Socket not connected, cannot publish message');
    }
  };

  const publish = useCallback((message: PublishMessage) => {
    publishRef.current?.(message);
  }, []);

  useEffect(() => {
    if (!opts.sessionId) {
      console.warn(
        'sessionId is required to establish WebSocket connection',
        opts.sessionId
      );
      return;
    }

    const isSecureContext =
      typeof window !== 'undefined' && window.location.protocol === 'https:';

    const targetUrl = resolveWebSocketUrl(url);

    const instance = io(targetUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      upgrade: true,
      timeout: 5000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      query: {
        sessionId: opts.sessionId, // 동적으로 설정된 sessionId 사용
      },
      secure: isSecureContext,
      withCredentials: true,
    });
    setClient(instance);
    clientRef.current = instance;

    // 이벤트 리스너 등록도 여기서 함께 처리
    instance.onAny((event) => {
      if (instance.listeners(event).length === 0) {
        console.warn(`missing handler for event ${event}`);
      }
    });

    instance.on('connect', () => {
      console.info('🟢 ioClient connected successfully to:', url);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;

      if (subscriptionsRef.current.length && !instance.recovered) {
        console.info('📡 Re-subscribing to topics:', subscriptionsRef.current);
        subscribeRef.current?.();
      }
    });

    instance.on('connect_error', (error) => {
      console.error('🔴 ioClient connection error:', error.message);
      console.error('🔴 Error details:', error);
      setIsConnected(false);
      setConnectionError(error.message);
      reconnectAttempts.current++;

      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached');
      }
    });

    instance.on('disconnect', (reason) => {
      console.info('🟡 ioClient disconnected:', reason);
      setIsConnected(false);
    });

    instance.on('reconnect', (attemptNumber) => {
      console.info(`ioClient reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
    });

    instance.on('reconnect_error', (error) => {
      console.error('ioClient reconnection error:', error);
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

    // 초기 구독 시도
    subscribeRef.current?.();

    return () => {
      if (instance) {
        unsubscribeRef.current?.();
        instance.close();
      }
    };
  }, [url, opts.sessionId]);

  // 이제 이 useEffect는 필요 없으므로 제거 // 빈 배열로 한 번만 실행

  return {
    client,
    publish,
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
  };
}
