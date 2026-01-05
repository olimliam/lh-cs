import { useRef, useCallback, useState, useEffect } from 'react';
import { WebRTCSignalingClient } from '../lib/webrtc-signaling-client';

interface UseWebRTCSignalOptions {
  onOffer?: (offer: RTCSessionDescriptionInit) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onScreenShareStart?: () => void;
  onScreenShareEnd?: () => void;
  onError?: (error: string) => void;
}

export const useWebRTCSignal = ({
  onOffer,
  onAnswer,
  onIceCandidate,
  onScreenShareStart,
  onScreenShareEnd,
  onError,
}: UseWebRTCSignalOptions = {}) => {
  const signalingClientRef = useRef<WebRTCSignalingClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userType, setUserType] = useState<'HOST' | 'VISITOR' | null>(null);

  // 콜백 함수들을 ref로 저장하여 최신 상태 유지
  const callbacksRef = useRef({
    onOffer,
    onAnswer,
    onIceCandidate,
    onScreenShareStart,
    onScreenShareEnd,
    onError,
  });

  // 콜백 함수들 업데이트
  useEffect(() => {
    callbacksRef.current = {
      onOffer,
      onAnswer,
      onIceCandidate,
      onScreenShareStart,
      onScreenShareEnd,
      onError,
    };
  });

  // 연결
  const connect = useCallback(
    async (consultationId: string, type: 'HOST' | 'VISITOR') => {
      try {
        if (signalingClientRef.current) {
          signalingClientRef.current.disconnect();
        }

        const client = new WebRTCSignalingClient(consultationId, type);
        signalingClientRef.current = client;

        await client.connect();
        setIsConnected(true);
        setUserType(type);

        // 이벤트 핸들러 등록 (ref를 통해 최신 콜백 사용)
        if (callbacksRef.current.onOffer) {
          client.onOffer(callbacksRef.current.onOffer);
        }
        if (callbacksRef.current.onAnswer) {
          client.onAnswer(callbacksRef.current.onAnswer);
        }
        if (callbacksRef.current.onIceCandidate) {
          client.onIceCandidate(callbacksRef.current.onIceCandidate);
        }
        if (callbacksRef.current.onScreenShareStart) {
          client.onScreenShareStart(callbacksRef.current.onScreenShareStart);
        }
        if (callbacksRef.current.onScreenShareEnd) {
          client.onScreenShareEnd(callbacksRef.current.onScreenShareEnd);
        }
        if (callbacksRef.current.onError) {
          client.onError(callbacksRef.current.onError);
        }

        console.log(`🎉 WebSocket Signaling connected as ${type}`);
      } catch (err) {
        const errorMessage = `WebSocket 연결 실패: ${err instanceof Error ? err.message : String(err)}`;
        if (callbacksRef.current.onError) {
          callbacksRef.current.onError(errorMessage);
        }
        setIsConnected(false);
        throw err;
      }
    },
    [] // 의존성 배열을 비워서 무한루프 방지
  );

  // 연결 해제
  const disconnect = useCallback(() => {
    if (signalingClientRef.current) {
      signalingClientRef.current.disconnect();
      signalingClientRef.current = null;
    }
    setIsConnected(false);
    setUserType(null);
  }, []);

  // Offer 전송
  const sendOffer = useCallback(async (offer: RTCSessionDescriptionInit) => {
    console.log('📤 Hook: Attempting to send Offer via WebRTC Signal');
    if (!signalingClientRef.current) {
      console.error('❌ Hook: Signaling client가 연결되지 않았습니다.');
      throw new Error('Signaling client가 연결되지 않았습니다.');
    }

    try {
      await signalingClientRef.current.sendOffer(offer);
      console.log('✅ Hook: Offer sent successfully via signaling client');
    } catch (error) {
      console.error('❌ Hook: Failed to send Offer:', error);
      throw error;
    }
  }, []);

  // Answer 전송
  const sendAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    if (!signalingClientRef.current) {
      throw new Error('Signaling client가 연결되지 않았습니다.');
    }
    await signalingClientRef.current.sendAnswer(answer);
  }, []);

  // ICE Candidate 전송
  const sendIceCandidate = useCallback(async (candidate: RTCIceCandidate) => {
    if (!signalingClientRef.current) {
      throw new Error('Signaling client가 연결되지 않았습니다.');
    }
    await signalingClientRef.current.sendIceCandidate(candidate);
  }, []);

  // 화면 공유 시작 알림
  const notifyScreenShareStart = useCallback(async () => {
    if (!signalingClientRef.current) {
      throw new Error('Signaling client가 연결되지 않았습니다.');
    }
    await signalingClientRef.current.notifyScreenShareStart();
  }, []);

  // 화면 공유 종료 알림
  const notifyScreenShareEnd = useCallback(async () => {
    if (!signalingClientRef.current) {
      throw new Error('Signaling client가 연결되지 않았습니다.');
    }
    await signalingClientRef.current.notifyScreenShareEnd();
  }, []);

  return {
    signalingClientRef,
    isConnected,
    userType,
    connect,
    disconnect,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    notifyScreenShareStart,
    notifyScreenShareEnd,
  };
};
