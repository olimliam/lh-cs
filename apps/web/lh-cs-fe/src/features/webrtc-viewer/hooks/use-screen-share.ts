import { useRef, useState, useCallback } from 'react';
import { SCREEN_SHARE_CONFIG } from '../constants/webrtc-config';
import {
  formatWebRTCError,
  cleanupStream,
  isStreamActive as checkStreamActive,
} from '../lib/webrtc-utils';

interface UseScreenShareOptions {
  displayMediaOptions?: MediaStreamConstraints;
  onStreamStarted?: (stream: MediaStream) => void;
  onStreamEnded?: () => void;
  onError?: (error: string) => void;
}

export const useScreenShare = ({
  displayMediaOptions = SCREEN_SHARE_CONFIG,
  onStreamStarted,
  onStreamEnded,
  onError,
}: UseScreenShareOptions = {}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  // 화면 공유 중지
  const stopScreenShare = useCallback(() => {
    if (streamRef.current) {
      cleanupStream(streamRef.current);
      streamRef.current = null;
    }

    setIsSharing(false);
    setError('');

    if (onStreamEnded) {
      onStreamEnded();
    }
  }, [onStreamEnded]);

  // 화면 공유 시작
  const startScreenShare = useCallback(async () => {
    try {
      setError('');

      // 기존 스트림이 있으면 정리
      if (streamRef.current) {
        cleanupStream(streamRef.current);
      }

      // 화면 캡처 시작
      const stream =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      streamRef.current = stream;

      setIsSharing(true);

      // 화면 공유 종료 시 자동 정리 (사용자가 브라우저에서 공유 중지한 경우)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      if (onStreamStarted) {
        onStreamStarted(stream);
      }

      return stream;
    } catch (err) {
      const errorMessage = formatWebRTCError(err);
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      throw err;
    }
  }, [displayMediaOptions, onStreamStarted, onError, stopScreenShare]);

  // 스트림이 활성 상태인지 확인
  const isStreamActive = useCallback(() => {
    return checkStreamActive(streamRef.current);
  }, []);

  return {
    isSharing,
    error,
    streamRef,
    startScreenShare,
    stopScreenShare,
    isStreamActive,
  };
};
