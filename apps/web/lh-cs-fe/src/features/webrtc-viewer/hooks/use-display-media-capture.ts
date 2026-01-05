import { useCallback, useRef, useState } from 'react';
import { IS_PREFER_CURRENT_TAB } from '../constants/webrtc-config';

interface UseDisplayMediaCaptureOptions {
  frameRate?: number;
  onStreamStarted?: (stream: MediaStream) => void;
  onStreamEnded?: () => void;
  onError?: (errorMessage: string) => void;
}

type ExtendedDisplayMediaStreamOptions = DisplayMediaStreamOptions & {
  preferCurrentTab?: boolean;
};

// 브라우저 화면 공유 지원 여부 확인
const isScreenSharingSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'
  );
};

export const useDisplayMediaCapture = ({
  frameRate = 30,
  onStreamStarted,
  onStreamEnded,
  onError,
}: UseDisplayMediaCaptureOptions = {}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // 스트림 정리 함수
  const cleanupStream = (stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      track.stop();
      console.log('🛑 Track stopped:', track.kind);
    });
  };

  // 화면 캡처 시작
  const startCapture = useCallback(async () => {
    try {
      // 이미 캡처 중이면 중복 요청 방지
      if (isCapturing) {
        console.log('🚫 Already capturing, skipping duplicate request');
        return streamRef.current!;
      }

      // 브라우저 지원 여부 확인
      if (!isScreenSharingSupported()) {
        throw new Error(
          '이 브라우저는 화면 공유를 지원하지 않습니다. Chrome, Firefox, 또는 Safari를 사용해주세요.'
        );
      }

      // 기존 스트림이 있으면 정리
      if (streamRef.current) {
        cleanupStream(streamRef.current);
      }

      const displayMediaOptions: ExtendedDisplayMediaStreamOptions = {
        video: {
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: frameRate, max: 60 },
        },
        audio: false,
        preferCurrentTab: IS_PREFER_CURRENT_TAB,
      };

      const stream =
        await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

      console.log('✅ Screen capture successful:', {
        tracks: stream.getVideoTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
          settings: track.getSettings(),
        })),
      });

      streamRef.current = stream;
      setIsCapturing(true);
      onStreamStarted?.(stream);

      // 사용자가 화면 공유를 중지했을 때 자동으로 정리
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          console.log('🛑 Screen sharing ended by user');
          setIsCapturing(false);
          streamRef.current = null;
          onStreamEnded?.();
        });
      });

      return stream;
    } catch (error) {
      console.error('❌ Screen capture failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Screen capture failed';

      if (
        errorMessage.includes('Permission denied') ||
        errorMessage.includes('NotAllowedError')
      ) {
        onError?.(
          '화면 공유 권한이 거부되었습니다. 브라우저에서 화면 공유를 허용해주세요.'
        );
      } else if (errorMessage.includes('NotSupportedError')) {
        onError?.('이 브라우저는 화면 공유를 지원하지 않습니다.');
      } else {
        onError?.(errorMessage);
      }

      throw error;
    }
  }, [frameRate, onStreamStarted, onError, isCapturing]);

  // 캡처 중지
  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      cleanupStream(streamRef.current);
      streamRef.current = null;
    }
    setIsCapturing(false);
    onStreamEnded?.();
    console.log('🛑 Screen capture stopped');
  }, [onStreamEnded]);

  return {
    isCapturing,
    startCapture,
    stopCapture,
    currentStream: streamRef.current,
  };
};
