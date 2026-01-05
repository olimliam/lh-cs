import React, { useRef, useEffect, forwardRef, useState } from 'react';
import styled from '@emotion/styled';

import { Box, Typography } from '@mui/material';

const WebRTCStyledVideo = styled.video`
  width: 100%;
  height: 100%;
`;
interface WebRTCVideoPlayerProps {
  stream?: MediaStream | null;
  autoPlay?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  placeholder?: string;
  onLoadedMetadata?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (errorMessage: string) => void;
}

export const WebRTCVideoPlayer = forwardRef<
  HTMLVideoElement,
  WebRTCVideoPlayerProps
>(
  (
    {
      stream,
      autoPlay = true,
      muted = true,
      playsInline = true,
      placeholder = '연결을 기다리는 중...',
      onLoadedMetadata,
      onPlay,
      onPause,
      onError,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const internalRef = ref || videoRef;
    const [requiresInteraction, setRequiresInteraction] = useState(false);

    // 비디오 이벤트 리스너 추가
    useEffect(() => {
      const video = (internalRef as React.RefObject<HTMLVideoElement>).current;
      if (!video) {
        return;
      }

      video.autoplay = autoPlay;
      video.muted = muted;
      video.playsInline = playsInline;

      const handleLoadedMetadata = () => {
        console.log('🎥 Video metadata loaded:', {
          videoWidth: video.videoWidth,
          videoHeight: video.videoHeight,
          duration: video.duration,
          readyState: video.readyState,
          paused: video.paused,
          currentTime: video.currentTime,
          autoplay: video.autoplay,
          muted: video.muted,
        });

        onLoadedMetadata?.();
      };

      const playSafely = () => {
        if (!autoPlay || !video.srcObject) {
          return;
        }

        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch((err: DOMException) => {
            if (err.name === 'AbortError') {
              console.info(
                '🎥 Video play aborted due to a new media load request (expected during track updates).'
              );
              return;
            }

            console.warn('Video autoplay failed:', err);
            // 사용자 제스처가 필요한 경우를 위한 클릭 이벤트 추가
            video.addEventListener(
              'click',
              () => {
                video.play().catch(console.warn);
              },
              { once: true }
            );

            setRequiresInteraction(true);
            onError?.(err.message || '자동 재생을 시작할 수 없습니다.');
          });
        }
      };

      const handleCanPlay = () => {
        console.log('🎥 Video can play');
        playSafely();
      };

      const handlePlay = () => {
        console.log('🎥 Video started playing');
        setRequiresInteraction(false);
        onPlay?.();
      };

      const handlePause = () => {
        onPause?.();
      };

      const handleError = (event: Event) => {
        console.error('❌ Video error:', event);

        const mediaElement = event.currentTarget as HTMLVideoElement | null;
        const mediaError = mediaElement?.error ?? undefined;
        const mediaErrorMessage =
          mediaError && 'message' in mediaError
            ? (mediaError as MediaError & { message?: string }).message
            : undefined;

        const errorMessage =
          mediaErrorMessage ??
          (mediaError
            ? `미디어 오류 코드 ${mediaError.code}`
            : '비디오 재생 중 오류가 발생했습니다.');

        onError?.(errorMessage);
      };

      if (stream) {
        if (video.srcObject !== stream) {
          if (!video.paused) {
            video.pause();
          }
          video.srcObject = stream;
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('error', handleError);

        // 일부 브라우저는 canplay 이전에 play 시도가 필요
        playSafely();
      } else {
        if (!video.paused) {
          video.pause();
        }
        video.removeAttribute('src');
        video.srcObject = null;
        setRequiresInteraction(false);
      }

      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('error', handleError);
      };
    }, [
      internalRef,
      stream,
      autoPlay,
      muted,
      playsInline,
      onLoadedMetadata,
      onPlay,
      onPause,
      onError,
    ]);

    return (
      <Box width='100%' height='100%'>
        <WebRTCStyledVideo
          ref={internalRef}
          autoPlay={autoPlay}
          muted={muted}
          playsInline={playsInline}
          onClick={() => {
            const video = (internalRef as React.RefObject<HTMLVideoElement>)
              .current;
            if (video) {
              if (video.paused) {
                video
                  .play()
                  .then(() => setRequiresInteraction(false))
                  .catch((err) => {
                    console.error(err);
                    setRequiresInteraction(true);
                    onError?.(err.message || '재생을 시작할 수 없습니다.');
                  });
              }
            }
          }}
        />

        {requiresInteraction && stream && (
          <Box
            position='absolute'
            top={0}
            left={0}
            width='100%'
            height='100%'
            display='flex'
            alignItems='center'
            justifyContent='center'
            sx={{
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              color: 'common.white',
              cursor: 'pointer',
              zIndex: 1,
            }}
            onClick={() => {
              const video = (internalRef as React.RefObject<HTMLVideoElement>)
                .current;
              if (!video) {
                return;
              }
              video
                .play()
                .then(() => setRequiresInteraction(false))
                .catch((err) => {
                  console.error(err);
                  setRequiresInteraction(true);
                  onError?.(err.message || '재생을 시작할 수 없습니다.');
                });
            }}
          >
            <Typography variant='body1' fontWeight={600}>
              화면을 클릭하여 재생을 시작하세요
            </Typography>
          </Box>
        )}

        {!stream && (
          <Box
            position='absolute'
            top='50%'
            left='50%'
            width='100%'
            height='100%'
            sx={{
              transform: 'translate(-50%, -50%)',
              color: 'text.secondary',
              fontSize: '0.875rem',
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              {placeholder}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
);

WebRTCVideoPlayer.displayName = 'WebRTCVideoPlayer';
