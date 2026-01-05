/**
 * WebRTC 관련 유틸리티 함수들
 */

import { Socket } from 'socket.io-client';
import { WEBRTC_TIMEOUTS } from '../constants/webrtc-config';

/**
 * ICE gathering 완료까지 대기하는 Promise
 */
export const waitForIceGatheringComplete = (
  peerConnection: RTCPeerConnection,
  timeout = WEBRTC_TIMEOUTS.ICE_GATHERING_TIMEOUT
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(
      '🧊 Starting ICE gathering wait, current state:',
      peerConnection.iceGatheringState
    );

    // ICE gathering이 이미 완료되었거나 없는 경우 즉시 resolve
    if (peerConnection.iceGatheringState === 'complete') {
      console.log('✅ ICE gathering already complete');
      resolve();
      return;
    }

    let candidateCount = 0;
    const maxCandidates = 3; // 최소 3개의 candidate를 받으면 진행
    const fallbackTimeout = 3000; // 3초 후 강제 진행

    // ICE candidate 이벤트 리스너
    const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        candidateCount++;
        console.log(
          `🧊 ICE candidate received (${candidateCount}):`,
          event.candidate.type
        );
      }
    };

    peerConnection.addEventListener('icecandidate', handleIceCandidate);

    const checkIceGatheringState = () => {
      const currentState = peerConnection.iceGatheringState;
      const elapsed = Date.now() - startTime;

      console.log(
        `🧊 ICE gathering check - State: ${currentState}, Elapsed: ${elapsed}ms, Candidates: ${candidateCount}`
      );

      // 완료 조건들
      if (currentState === 'complete') {
        console.log('✅ ICE gathering completed successfully');
        peerConnection.removeEventListener('icecandidate', handleIceCandidate);
        resolve();
      } else if (elapsed > fallbackTimeout && candidateCount >= maxCandidates) {
        console.log(
          `⏰ ICE gathering fallback - proceeding with ${candidateCount} candidates after ${elapsed}ms`
        );
        peerConnection.removeEventListener('icecandidate', handleIceCandidate);
        resolve();
      } else if (elapsed > timeout) {
        console.error('❌ ICE gathering timeout after', elapsed, 'ms');
        peerConnection.removeEventListener('icecandidate', handleIceCandidate);
        reject(new Error('ICE gathering timeout'));
      } else {
        setTimeout(
          checkIceGatheringState,
          WEBRTC_TIMEOUTS.ICE_GATHERING_CHECK_INTERVAL
        );
      }
    };

    checkIceGatheringState();
  });
};

/**
 * WebRTC 에러를 사용자 친화적인 메시지로 변환
 */
export const formatWebRTCError = (error: unknown): string => {
  if (error instanceof Error) {
    // DOMException 처리
    if (error.name === 'NotAllowedError') {
      return '화면 공유 권한이 거부되었습니다.';
    }
    if (error.name === 'NotFoundError') {
      return '화면 공유 장치를 찾을 수 없습니다.';
    }
    if (error.name === 'OverconstrainedError') {
      return '화면 공유 설정이 지원되지 않습니다.';
    }
    if (error.name === 'NotReadableError') {
      return '화면 공유 장치에 접근할 수 없습니다.';
    }
    if (error.name === 'TypeError') {
      return '화면 공유 설정이 올바르지 않습니다.';
    }

    return error.message;
  }

  return String(error);
};

/**
 * RTCPeerConnectionState를 한국어로 변환
 */
export const formatConnectionState = (
  state: RTCPeerConnectionState
): string => {
  const stateMap: Record<RTCPeerConnectionState, string> = {
    new: '새로운 연결',
    connecting: '연결 중',
    connected: '연결됨',
    disconnected: '연결 끊김',
    failed: '연결 실패',
    closed: '연결 종료',
  };

  return stateMap[state] || state;
};

/**
 * JSON 문자열이 유효한 RTCSessionDescriptionInit인지 검증
 */
export const validateSessionDescription = (
  jsonString: string
): RTCSessionDescriptionInit => {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('올바른 세션 정보가 아닙니다.');
    }

    if (!parsed.type || !['offer', 'answer'].includes(parsed.type)) {
      throw new Error('세션 타입이 올바르지 않습니다.');
    }

    if (!parsed.sdp || typeof parsed.sdp !== 'string') {
      throw new Error('SDP 정보가 올바르지 않습니다.');
    }

    return parsed as RTCSessionDescriptionInit;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('JSON 형식이 올바르지 않습니다.');
    }
    throw error;
  }
};

/**
 * MediaStream이 활성 상태인지 확인
 */
export const isStreamActive = (stream: MediaStream | null): boolean => {
  if (!stream) return false;
  return stream.getTracks().some((track) => track.readyState === 'live');
};

/**
 * MediaStream 정리 (모든 트랙 중지)
 */
export const cleanupStream = (stream: MediaStream | null): void => {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
};

export const sendWebSocketMessage = (
  client: Socket | null,
  topic: string,
  body: any
): void => {
  const message = JSON.stringify(body);

  client?.emit(topic, message);
};
