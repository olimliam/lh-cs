import { api } from '@/shared/api/api-client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { zoomClient } from './zoomClient';
import { CommonResponse } from '@/shared/types/common-response.types';

export type ZoomRole = 'HOST' | 'GUEST';

type JoinParams = {
  consultationId: string;
  userId: string;
  userName: string;
  role: ZoomRole;
};

type ZoomMediaStream = ReturnType<typeof zoomClient.getMediaStream>;
type ZoomTokenPayload = { sessionName: string; token: string };

/**
 * Zoom Video SDK 세션 참가 및 화면 공유/수신을 관리하는 공통 훅.
 * - 토큰 요청 → init → join → mediaStream 보관
 * - 호스트 화면 공유 시작/종료
 * - 게스트 화면 공유 렌더링(canvas 바인딩)
 */
export function useZoomVideoSession() {
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaStream, setMediaStream] = useState<ZoomMediaStream | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shareActive, setShareActive] = useState(false);

  const shareViewTargetRef = useRef<HTMLCanvasElement | null>(null);
  const shareVideoRef = useRef<HTMLVideoElement | null>(null);
  const stopShareInFlightRef = useRef(false);
  const mediaStreamRef = useRef<ZoomMediaStream | null>(null);
  const pendingShareStateRef = useRef<{
    state: 'Active' | 'Inactive';
    userId?: number;
  } | null>(null);

  const applyShareState = useCallback(
    async (state: 'Active' | 'Inactive', userId?: number) => {
      const stream = mediaStreamRef.current;
      const canvas = shareViewTargetRef.current;

      if (!stream || !canvas) {
        pendingShareStateRef.current = { state, userId };
        return;
      }

      try {
        if (state === 'Active' && typeof userId === 'number') {
          setShareActive(true);
          await stream.startShareView(canvas, userId);
        } else {
          setShareActive(false);
          await stream.stopShareView();
          await stream.clearVideoCanvas(canvas);
        }
        pendingShareStateRef.current = null;
      } catch (e) {
        console.error('applyShareState error', e);
      }
    },
    []
  );

  useEffect(() => {
    const handleActiveShareChange = async (payload: any) => {
      console.log('[ZOOM] active-share-change payload:', payload, {
        hasMediaStream: !!mediaStreamRef.current,
        hasCanvas: !!shareViewTargetRef.current,
      });
      const nextState = payload?.state as 'Active' | 'Inactive';
      const userId = payload?.userId as number | undefined;
      if (!nextState) return;
      await applyShareState(nextState, userId);
    };

    zoomClient.on('active-share-change', handleActiveShareChange);
    return () => {
      zoomClient.off('active-share-change', handleActiveShareChange);
    };
  }, [applyShareState, mediaStream]);

  // 호스트가 이미 공유 중인 상태에서 후입장하는 방문자가 즉시 수신할 수 있도록 초기 상태를 점검
  useEffect(() => {
    const startInitialShareView = async () => {
      if (!mediaStream || !shareViewTargetRef.current) return;

      const activeShareUserId = mediaStream.getActiveShareUserId?.();
      if (!activeShareUserId) return;

      await applyShareState('Active', activeShareUserId);
    };

    startInitialShareView();
  }, [applyShareState, mediaStream]);

  useEffect(() => {
    if (!pendingShareStateRef.current) return;
    const { state, userId } = pendingShareStateRef.current;
    applyShareState(state, userId);
  }, [applyShareState, mediaStream]);

  const join = useCallback(
    async ({ consultationId, userId, userName, role }: JoinParams) => {
      if (joined || joining) return;
      setJoining(true);
      setError(null);

      try {
        const { data } = await api.post<
          CommonResponse<ZoomTokenPayload> | ZoomTokenPayload
        >('zoom/video-token', {
          consultationId,
          role,
          userId,
          userName,
        });

        const payload: ZoomTokenPayload | undefined =
          (data as CommonResponse<ZoomTokenPayload>)?.data ||
          (data as ZoomTokenPayload);

        if (!payload?.sessionName || !payload?.token) {
          throw new Error('Zoom 토큰 응답이 올바르지 않습니다.');
        }

        const sessionName = String(payload.sessionName);
        const token = String(payload.token);
        const displayName = String(userName);

        await zoomClient.init('ko-KR', 'Global');
        await zoomClient.join(sessionName, token, displayName);

        const stream = zoomClient.getMediaStream();
        mediaStreamRef.current = stream;
        setMediaStream(stream);

        // 마이크 권한이 필요 없는 뷰어이므로 오디오 초기화를 생략한다.

        setJoined(true);

        // 세션 정보에서 Zoom sessionId를 저장 (Zoom API 호출용)
        const info = zoomClient.getSessionInfo?.();
        if (info?.sessionId) {
          setSessionId(info.sessionId);
        }

        console.log(
          '✅ Zoom 세션 참가 성공==================',
          data,
          info?.sessionId
        );
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Unknown error');
        throw e;
      } finally {
        setJoining(false);
      }
    },
    [joined, joining]
  );

  const leave = useCallback(async () => {
    try {
      await zoomClient.leave();
    } finally {
      setJoined(false);
      setMediaStream(null);
      mediaStreamRef.current = null;
      setSessionId(null);
      setShareActive(false);
      if (shareVideoRef.current?.parentElement) {
        shareVideoRef.current.parentElement.removeChild(shareVideoRef.current);
      }
      shareVideoRef.current = null;
    }
  }, []);

  const startShareScreen = useCallback(async () => {
    const stream =
      mediaStreamRef.current ?? zoomClient.getMediaStream?.() ?? null;

    if (!stream) {
      throw new Error('Media stream not initialized');
    }

    if (!shareVideoRef.current) {
      shareVideoRef.current = document.createElement('video');
      shareVideoRef.current.style.display = 'none';
      document.body.appendChild(shareVideoRef.current);
    }

    try {
      await stream.startShareScreen(shareVideoRef.current);
    } catch (e) {
      console.error('startShareScreen error', e);
      throw e;
    }
  }, []);

  const stopShareScreen = useCallback(async () => {
    const stream =
      mediaStreamRef.current ?? zoomClient.getMediaStream?.() ?? null;
    if (!stream || stopShareInFlightRef.current) return;

    const sessionInfo = zoomClient.getSessionInfo?.();
    const currentUser = zoomClient.getCurrentUserInfo?.();

    // 세션이 종료되었거나 참여 중이 아니면 호출 생략
    if (sessionInfo && sessionInfo.isInMeeting === false) {
      return;
    }

    // 화면 공유 중이 아니면 호출 생략
    if (currentUser && !currentUser.sharerOn) {
      return;
    }

    stopShareInFlightRef.current = true;
    try {
      await stream.stopShareScreen();
    } catch (e: any) {
      if (e?.type === 'IMPROPER_MEETING_STATE') {
        console.warn('stopShareScreen skipped due to meeting state', e?.reason);
        return;
      }
      console.error('stopShareScreen error', e);
      throw e;
    } finally {
      if (shareVideoRef.current?.parentElement) {
        shareVideoRef.current.parentElement.removeChild(shareVideoRef.current);
      }
      shareVideoRef.current = null;
      stopShareInFlightRef.current = false;
    }
  }, []);

  const bindShareViewTarget = useCallback(
    (el: HTMLCanvasElement | null) => {
      shareViewTargetRef.current = el;
      if (pendingShareStateRef.current) {
        const { state, userId } = pendingShareStateRef.current;
        applyShareState(state, userId);
      }
    },
    [applyShareState]
  );

  return {
    joined,
    joining,
    error,
    mediaStream,
    shareActive,
    join,
    leave,
    startShareScreen,
    stopShareScreen,
    bindShareViewTarget,
    sessionId,
  };
}
