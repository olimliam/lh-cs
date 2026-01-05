import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { formatWebRTCError, cleanupStream } from '../lib/webrtc-utils';

interface UseTravelerCanvasCaptureOptions {
  frameRate?: number;
  onStreamStarted?: (stream: MediaStream) => void;
  onStreamEnded?: () => void;
  onError?: (error: string) => void;
}

export const useTravelerCanvasCapture = ({
  frameRate = 30,
  onStreamStarted,
  onStreamEnded,
  onError,
}: UseTravelerCanvasCaptureOptions = {}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);

  // DOM 영역 찾기
  const findTravelerWrapper = useCallback(():
    | HTMLElement
    | HTMLCanvasElement
    | null => {
    // traveler-viewer-wrapper ID로 찾기 (필수)
    const travelerWrapper = document.getElementById('traveler-viewer-wrapper');
    if (travelerWrapper) {
      console.log('🎯 Found traveler-viewer-wrapper:', {
        id: travelerWrapper.id,
        className: travelerWrapper.className,
        width: travelerWrapper.clientWidth,
        height: travelerWrapper.clientHeight,
      });
      return travelerWrapper;
    }

    console.warn('⚠️ No traveler-viewer-wrapper found');
    return null;
  }, []);

  // DOM 영역 스트림 캡처 시작
  const startCapture = useCallback(async () => {
    try {
      setError('');

      // 기존 스트림이 있으면 정리
      if (streamRef.current) {
        cleanupStream(streamRef.current);
      }

      // DOM 영역 결정
      const targetArea = findTravelerWrapper();

      if (!targetArea) {
        throw new Error(
          'DOM 영역을 찾을 수 없습니다. #traveler-viewer-wrapper 요소가 존재하는지 확인해주세요.'
        );
      }

      let stream: MediaStream | null = null;

      // Canvas 요소인 경우 직접 captureStream 사용
      if (targetArea instanceof HTMLCanvasElement) {
        try {
          stream = targetArea.captureStream(frameRate);
          console.log('✅ Canvas captureStream successful');
        } catch (captureError) {
          console.warn('🚫 Canvas captureStream failed:', captureError);
          throw new Error('Canvas 캡처가 실패했습니다.');
        }
      } else {
        // 일반 DOM 요소는 html2canvas로 이미지 변환 후 캡처
        try {
          console.log('🎨 Starting html2canvas capture...');
          const canvas = await html2canvas(targetArea as HTMLElement, {
            backgroundColor: null,
            useCORS: true,
            logging: false,
            scale: 1,
          });

          console.log('🎨 html2canvas completed, canvas size:', {
            width: canvas.width,
            height: canvas.height,
          });

          stream = canvas.captureStream(frameRate);
          console.log(
            '✅ html2canvas captureStream successful, tracks:',
            stream.getTracks().map((track) => ({
              kind: track.kind,
              enabled: track.enabled,
              readyState: track.readyState,
            }))
          );
        } catch (captureError) {
          console.warn('🚫 html2canvas capture failed:', captureError);
          throw new Error('html2canvas로 DOM 캡처가 실패했습니다.');
        }
      }

      if (!stream || stream.getTracks().length === 0) {
        throw new Error('DOM 영역에서 스트림을 캡처할 수 없습니다.');
      }

      // 스트림이 중단되었을 때 자동으로 상태 업데이트
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          console.log('📹 Track ended, stopping capture');
          // 직접 정리 로직 실행
          if (streamRef.current) {
            cleanupStream(streamRef.current);
            streamRef.current = null;
          }
          setIsCapturing(false);
          setError('');
          if (onStreamEnded) {
            onStreamEnded();
          }
        });
      });

      streamRef.current = stream;
      setIsCapturing(true);

      // DOM 영역 크기 정보 로깅
      const rect = (targetArea as HTMLElement).getBoundingClientRect();
      console.log('📹 DOM area capture started:', {
        width: rect.width,
        height: rect.height,
        frameRate,
        tracks: stream.getTracks().length,
        elementId: (targetArea as HTMLElement).id || 'no-id',
        captureMethod:
          targetArea instanceof HTMLCanvasElement
            ? 'canvas-direct'
            : 'html-element',
      });

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
  }, [frameRate, onStreamStarted, onError, onStreamEnded, findTravelerWrapper]);

  // 캡처 중지
  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      cleanupStream(streamRef.current);
      streamRef.current = null;
    }

    setIsCapturing(false);
    setError('');

    if (onStreamEnded) {
      onStreamEnded();
    }
  }, [onStreamEnded]);

  return {
    isCapturing,
    error,
    streamRef,
    startCapture,
    stopCapture,
    findTravelerWrapper,
  };
};
