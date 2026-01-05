import { useConsultationDetail } from '@/features/consultation/api/consultation-hooks';
import useIOClient from '@/features/drawer/model/use-io-client';
import {
  CameraFovMessage,
  CameraRotationMessage,
  DeviceInfoMessage,
  DRAW_TYPE,
  MarkerClickMessage,
  RemotePopupClosedMessage,
  PointerMoveMessage,
  SceneChangeMessage,
  UserPresenceMessage,
  ViewportSyncMessage,
  ViewSyncMessage,
} from '@/features/drawer/model/whiteboard.types';
import DrawingBoard from '@/features/drawer/ui/drawing-board';
import {
  TourNavigationControls,
  useTourNavigationStore,
} from '@/features/tour-navigation';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import TourLoading from '@/shared/ui/tour-loading';
import {
  TravelerTour,
  TravelerViewer,
  TourMarkerType,
  TravelerMarkerContent,
  RemotePointerState,
  useViewer,
} from '@packages/traveler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ViewportDetector } from '@/features/viewport-sync/lib/viewport-detector';
// import { TourInfo } from './tour-info';
import { ArrowDownIcon } from '@/shared/ui/icons/arrow-down-icon';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { WsEmitEventsEnum } from '@/shared/model/ws-emit-events.enum';
import { useConsultationStatistics } from '@/features/statistics/api';
import { useAuthStore } from '@/features/auth/model/store';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';
import { useGetAllTourFacilitiesByCdnId } from '@/shared/api/hooks/tour-facilities-hooks';
import { updateTourFacility } from '@/shared/api/tour-facility-query-api';

// Tour Viewer Component
// Tour 이동 및 SceneId 이동 동기화 + WebSocket 중앙화
// 사용자 모드일때는 마스터 뷰포트에 자동 동기화
interface TourViewerProps {
  tourCdnId: string;
  consultationId?: string;
  onCameraChange?: (camera: {
    rotation: { pitch: number; yaw: number };
    fov: number;
  }) => void;
  openConsultationInfo?: boolean;
  onMarkerClick?: (
    markerId: number,
    markerType?: TourMarkerType,
    markerContent?: TravelerMarkerContent
  ) => void;
  onLocalMarkerClick?: (
    markerId: number,
    markerType?: TourMarkerType,
    markerContent?: TravelerMarkerContent
  ) => void;
  onRemoteMarkerClick?: (
    markerId: number,
    markerType?: TourMarkerType,
    markerContent?: TravelerMarkerContent
  ) => void;
}

export const TourViewer = (props: TourViewerProps) => {
  const {
    onCameraChange,
    onMarkerClick: onMarkerClickProp,
    onLocalMarkerClick,
    onRemoteMarkerClick,
  } = props;
  const [isTourLoaded, setIsTourLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const {
    isSharingMode,
    isDrawingMode,
    toggleDrawingMode,
    setUserMode,
    userMode,
    isCameraEditMode,
    toggleCameraEditMode,
  } = useTourNavigationStore();

  // 사용자일때는 초기값을 true로 설정 해야 그리기 모드 및 뷰포트 동기화가 바로 적용됨
  const [hasUserInteracted, setHasUserInteracted] = useState(
    userMode === UserRoleEnum.VISITOR
  );

  const [_connectedUsers, setConnectedUsers] = useState<
    Map<string, UserPresenceMessage['data']>
  >(new Map());
  const [_deviceInfos, setDeviceInfos] = useState<
    Map<string, DeviceInfoMessage['data']>
  >(new Map());

  // 그림 관련 메시지를 DrawingBoard로 라우팅하기 위한 상태
  const [drawingMessage, setDrawingMessage] = useState<string | null>(null);

  const { consultationId } = useParams<{ consultationId: string }>();

  // 상담실 정보 가져오기
  const { data: consultationData } = useConsultationDetail(
    consultationId || ''
  );

  const {
    setLoaded,
    setOnSceneClick,
    moveToTargetSpot,
    setOnRotationChange,
    setOnFovChange,
    setCameraRotation,
    setCameraFov,
    setCameraControlEnabled,
    setMarkerContent,
    state: viewerState,
    getCurrentScene,
  } = useViewer();
  const sessionIdRef = useRef<string>(props.consultationId || '');
  const userIdRef = useRef<string>(`user_${Date.now()}`);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const viewportDetectorRef = useRef<ViewportDetector | null>(null);
  const pointerSendRafRef = useRef<number | null>(null);
  const pendingPointerRef = useRef<{ x: number; y: number } | null>(null);
  const [remotePointers, setRemotePointers] = useState<RemotePointerState[]>(
    []
  );
  const previousMarkerContentRef = useRef(viewerState.markerContent);
  const { logPopupToggle: logPopupOpen } = useConsultationStatistics();
  const authUser = useAuthStore((state) => state.user);
  const authUserId = authUser?.id;
  const activeConsultationId = props.consultationId ?? consultationId;
  const localMarkerClick = onLocalMarkerClick ?? onMarkerClickProp;
  const remoteMarkerClick = onRemoteMarkerClick ?? onMarkerClickProp;

  const [showPositionControls, setShowPositionControls] = useState(false);

  // WebSocket 메시지 핸들러
  const handleWebSocketMessage = useCallback(
    (messageStr: string | object) => {
      try {
        const message =
          typeof messageStr === 'string' ? JSON.parse(messageStr) : messageStr;

        switch (message.type) {
          case WsEmitEventsEnum.SCENE_CHANGE: {
            const sceneMsg = message as SceneChangeMessage;
            if (
              sceneMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              moveToTargetSpot(Number(sceneMsg.data.sceneId));
              if (currentSceneId !== sceneMsg.data.sceneId) {
                setCurrentSceneId(sceneMsg.data.sceneId);
              }
            }
            break;
          }

          case WsEmitEventsEnum.VIEW_SYNC: {
            const viewMsg = message as ViewSyncMessage;

            if (
              viewMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              toggleDrawingMode();
              if (currentSceneId !== viewMsg.data.sceneId) {
                moveToTargetSpot(Number(viewMsg.data.sceneId));
                setCurrentSceneId(viewMsg.data.sceneId);
              }
            }
            break;
          }

          case WsEmitEventsEnum.USER_PRESENCE: {
            const presenceMsg = message as UserPresenceMessage;
            setConnectedUsers((prev) => {
              const newMap = new Map(prev);
              if (presenceMsg.data.isConnected) {
                newMap.set(presenceMsg.data.userId, presenceMsg.data);
              } else {
                newMap.delete(presenceMsg.data.userId);
              }
              return newMap;
            });
            break;
          }

          case WsEmitEventsEnum.VIEWPORT_SYNC: {
            const viewportMsg = message as ViewportSyncMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              viewportMsg.data.isMaster &&
              hasUserInteracted
            ) {
              // 사용자 모드에서는 마스터의 뷰포트에 자동 동기화

              if (currentSceneId !== viewportMsg.data.sceneId) {
                moveToTargetSpot(Number(viewportMsg.data.sceneId));
                setCurrentSceneId(viewportMsg.data.sceneId);
              }
            }
            break;
          }

          case WsEmitEventsEnum.DEVICE_INFO: {
            const deviceMsg = message as DeviceInfoMessage;
            if (userMode === UserRoleEnum.ADMIN) {
              setDeviceInfos((prev) => {
                const newMap = new Map(prev);
                newMap.set(deviceMsg.data.userId, deviceMsg.data);
                return newMap;
              });
            }
            break;
          }

          case WsEmitEventsEnum.CAMERA_ROTATION: {
            const rotationMsg = message as CameraRotationMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              rotationMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              // 사용자 모드에서는 관리자의 카메라 회전에 따라 동기화
              setCameraRotation(
                rotationMsg.data.pitch,
                rotationMsg.data.yaw,
                rotationMsg.data.roll
              );
              if (currentSceneId !== rotationMsg.data.sceneId) {
                moveToTargetSpot(Number(rotationMsg.data.sceneId));
                setCurrentSceneId(rotationMsg.data.sceneId);
              }
            }
            break;
          }

          case WsEmitEventsEnum.CAMERA_FOV: {
            const fovMsg = message as CameraFovMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              fovMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              // 사용자 모드에서는 관리자의 FOV에 따라 동기화
              if (currentSceneId !== fovMsg.data.sceneId) {
                moveToTargetSpot(Number(fovMsg.data.sceneId));
                setCurrentSceneId(fovMsg.data.sceneId);
              }
              setCameraFov(fovMsg.data.fov);
            }
            break;
          }

          case WsEmitEventsEnum.POINTER_MOVE: {
            const pointerMsg = message as PointerMoveMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              pointerMsg.data.userId !== userIdRef.current
            ) {
              const { x, y } = pointerMsg.data.pointer;
              const now = Date.now();
              const remoteUserId = pointerMsg.data.userId || 'remote';
              setRemotePointers((prev) => {
                const filtered = prev.filter((p) => p.userId !== remoteUserId);
                return [
                  ...filtered,
                  {
                    userId: remoteUserId,
                    x,
                    y,
                    visible: true,
                    updatedAt: now,
                    action: pointerMsg.data.action,
                  },
                ];
              });
            }
            break;
          }

          case WsEmitEventsEnum.MARKER_CLICK: {
            const markerMsg = message as MarkerClickMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              markerMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              setMarkerContent({
                markerId: markerMsg.data.markerId,
                type: markerMsg.data.markerType ?? null,
                option: markerMsg.data.markerContent ?? null,
              });

              remoteMarkerClick?.(
                markerMsg.data.markerId,
                markerMsg.data.markerType,
                markerMsg.data.markerContent
              );
            }
            break;
          }

          case WsEmitEventsEnum.REMOTE_POPUP_CLOSED: {
            const closeMsg = message as RemotePopupClosedMessage;
            if (
              userMode === UserRoleEnum.VISITOR &&
              closeMsg.data.userId !== userIdRef.current &&
              hasUserInteracted
            ) {
              setMarkerContent({
                markerId: null,
                type: null,
                option: null,
              });
            }
            break;
          }

          // 그림 관련 메시지들을 DrawingBoard로 라우팅
          case DRAW_TYPE.SLIDE_LIST:
          case DRAW_TYPE.IMAGE_UPDATE:
          case DRAW_TYPE.START:
          case DRAW_TYPE.DRAW:
          case DRAW_TYPE.STOP:
          case DRAW_TYPE.CLEAR:
          case DRAW_TYPE.UNDO:
          case DRAW_TYPE.REDO:
            // 자신이 보낸 메시지는 처리하지 않음 (연쇄 교환 방지)
            if (message.userId !== userIdRef.current) {
              console.log(
                'Routing drawing message to DrawingBoard:',
                message.type,
                'from user:',
                message.userId
              );
              setDrawingMessage(
                typeof messageStr === 'string'
                  ? messageStr
                  : JSON.stringify(messageStr)
              );
            } else {
              console.log(
                'Ignoring own drawing message:',
                message.type,
                'from user:',
                message.userId
              );
            }
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    },
    [userMode, moveToTargetSpot]
  );

  // Socket.IO 클라이언트 초기화
  const { client, publish, isConnected } = useIOClient(
    import.meta.env.VITE_WS_URL,
    {
      onMessage: handleWebSocketMessage,
      sessionId: consultationId,
    }
  );

  const handleTourMarkerClick = useCallback(
    (
      markerId: number,
      markerType?: TourMarkerType,
      markerContent?: TravelerMarkerContent
    ) => {
      localMarkerClick?.(markerId, markerType, markerContent);

      console.log('handleTourMarkerClick......', userMode);

      if (userMode === UserRoleEnum.ADMIN) {
        const markerMsg: MarkerClickMessage = {
          type: WsEmitEventsEnum.MARKER_CLICK,
          data: {
            markerId,
            markerType,
            markerContent,
            timestamp: Date.now(),
            userId: userIdRef.current,
            userRole: userMode,
          },
          sessionId: sessionIdRef.current,
          timestamp: Date.now(),
          userId: userIdRef.current,
        };

        publish(markerMsg);
      }

      if (
        !activeConsultationId ||
        !authUserId ||
        userMode === UserRoleEnum.VISITOR
      ) {
        return;
      }

      if (markerType !== TourMarkerType.popup) {
        return;
      }

      let facilityId: string | undefined;
      if (
        markerContent &&
        typeof markerContent === 'object' &&
        'metaData' in markerContent
      ) {
        const metaDataCandidate = markerContent.metaData;
        if (metaDataCandidate && typeof metaDataCandidate === 'object') {
          const normalizedMeta = metaDataCandidate as Record<string, unknown>;
          const facilityCandidate =
            normalizedMeta.facilityId ?? normalizedMeta.facility_id;
          if (facilityCandidate !== undefined && facilityCandidate !== null) {
            facilityId = String(facilityCandidate);
          }
        }
      }

      void logPopupOpen(
        activeConsultationId,
        authUserId,
        markerId.toString(),
        facilityId
      );
    },
    [
      activeConsultationId,
      authUserId,
      localMarkerClick,
      logPopupOpen,
      publish,
      userMode,
    ]
  );

  // 마커 팝업 닫힘 감지 → Visitor에게 동기화
  useEffect(() => {
    const previousMarkerContent = previousMarkerContentRef.current;
    const currentMarkerContent = viewerState.markerContent;

    const wasOpen = !!previousMarkerContent?.option;
    const isClosedNow = !currentMarkerContent?.option;
    const hasMarkerId =
      previousMarkerContent?.markerId !== null &&
      previousMarkerContent?.markerId !== undefined;

    if (
      userMode === UserRoleEnum.ADMIN &&
      wasOpen &&
      isClosedNow &&
      hasMarkerId &&
      sessionIdRef.current
    ) {
      const closeMsg: RemotePopupClosedMessage = {
        type: WsEmitEventsEnum.REMOTE_POPUP_CLOSED,
        data: {
          markerId: previousMarkerContent!.markerId as number | string,
          markerType: previousMarkerContent?.type ?? undefined,
          markerContent: previousMarkerContent?.option ?? undefined,
          userId: userIdRef.current,
          userRole: userMode,
          timestamp: Date.now(),
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };

      publish(closeMsg);
    }

    previousMarkerContentRef.current = currentMarkerContent;
  }, [viewerState.markerContent, userMode, publish]);

  // sessionIdRef 업데이트
  useEffect(() => {
    console.log('test consultationId', consultationId);
    if (consultationId) {
      sessionIdRef.current = consultationId;
    }
  }, [consultationId]);

  const TARGET_VERSION_PATH = 'latest.json';

  const tourUrl = useMemo(
    () =>
      `${import.meta.env.VITE_TOUR_CDN_URL}/backstage/tours/${props.tourCdnId}/json/${TARGET_VERSION_PATH}`,
    [props.tourCdnId]
  );

  // 디바이스 정보 전송
  const sendDeviceInfo = useCallback(async () => {
    try {
      const deviceInfoMsg =
        await viewportDetectorRef.current?.createDeviceInfoMessage(
          userIdRef.current,
          userMode,
          sessionIdRef.current
        );
      if (deviceInfoMsg) {
        publish(deviceInfoMsg);
      }
    } catch (error) {
      console.error('Failed to send device info:', error);
    }
  }, [userMode, publish]);

  // 뷰포트 동기화 전송 (디바운스 적용)
  const sendViewportSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      if (!viewportDetectorRef.current) {
        viewportDetectorRef.current = new ViewportDetector();
      }

      const fullViewport =
        await viewportDetectorRef.current.getCurrentViewport();

      console.log('Full viewport data:', fullViewport);
      console.log('Device info available:', !!fullViewport.device);

      // ViewportSyncMessage 형태로 변환 (기존 타입에 맞게)
      const viewportMsg: ViewportSyncMessage = {
        type: WsEmitEventsEnum.VIEWPORT_SYNC,
        data: {
          sceneId: currentSceneId,
          userId: userIdRef.current,
          userRole: userMode,
          viewport: {
            width: fullViewport.width,
            height: fullViewport.height,
            aspectRatio: fullViewport.aspectRatio,
            devicePixelRatio: fullViewport.devicePixelRatio,
            orientation: fullViewport.orientation,
          },
          // 상세한 디바이스 정보도 함께 전송
          device: fullViewport.device,
          timestamp: Date.now(),
          isMaster: userMode === UserRoleEnum.ADMIN,
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };

      console.log('Preparing to send viewport sync message...', viewportMsg);
      publish(viewportMsg);
    }, 300);
  }, [userMode, publish]);

  // 사용자 접속 상태 전송
  const sendUserPresence = useCallback(
    (isConnected: boolean) => {
      const presenceMsg: UserPresenceMessage = {
        type: WsEmitEventsEnum.USER_PRESENCE,
        data: {
          userId: userIdRef.current,
          userRole: userMode,
          isConnected,
          timestamp: Date.now(),
          sessionId: sessionIdRef.current,
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };
      publish(presenceMsg);
    },
    [userMode, publish]
  );

  // 씬 변경 공유
  const shareSceneChange = useCallback(
    (sceneId: number, title?: string, description?: string) => {
      console.log('shareSceneChange called:', {
        sceneId,
        isSharingMode,
        userRole: userMode,
      });

      if (!isSharingMode) {
        console.log('❌ Scene change not shared - sharing mode is OFF');
        return;
      }

      console.log('✅ Sending scene change message');
      const sceneMsg: SceneChangeMessage = {
        type: WsEmitEventsEnum.SCENE_CHANGE,
        data: {
          sceneId,
          title,
          description,
          timestamp: Date.now(),
          userId: userIdRef.current,
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };
      publish(sceneMsg);
    },
    [isSharingMode, publish]
  );

  // 뷰 동기화 공유
  const shareViewSync = useCallback(
    (drawingMode: boolean) => {
      const viewMsg: ViewSyncMessage = {
        type: WsEmitEventsEnum.VIEW_SYNC,
        data: {
          sceneId: currentSceneId!,
          isDrawingMode: drawingMode,
          timestamp: Date.now(),
          userId: userIdRef.current,
          userRole: userMode,
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };
      publish(viewMsg);
    },
    [userMode, publish]
  );

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 전역 store에 userMode 설정
    setUserMode(userMode);

    sendUserPresence(true);
    sendDeviceInfo();

    // 사용자 모드에서는 뷰포트 변경 시 자동 동기화
    if (userMode === UserRoleEnum.VISITOR) {
      const handleResize = () => sendViewportSync();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        if (viewportDetectorRef.current) {
          viewportDetectorRef.current.destroy();
          viewportDetectorRef.current = null;
        }
      };
    }
  }, [
    sendUserPresence,
    sendDeviceInfo,
    sendViewportSync,
    userMode,
    setUserMode,
  ]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      sendUserPresence(false);
    };
  }, [sendUserPresence]);

  // 리모트 포인터 표시/숨김 제어
  useEffect(() => {
    if (!remotePointers.length) {
      return;
    }

    const timers = remotePointers.map((pointer) =>
      window.setTimeout(() => {
        setRemotePointers((prev) =>
          prev.map((p) =>
            p.userId === pointer.userId && p.updatedAt === pointer.updatedAt
              ? { ...p, visible: false }
              : p
          )
        );
      }, 2000)
    );

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [remotePointers]);

  const [currentSceneId, setCurrentSceneId] = useState<number | undefined>(
    undefined
  );
  const { logDrawingModeToggle } = useConsultationStatistics();
  useEffect(() => {
    if (isDrawingMode && currentSceneId && consultationId) {
      logDrawingModeToggle(
        consultationId,
        userIdRef.current,
        String(currentSceneId),
        isDrawingMode
      );
    }
  }, [isDrawingMode, currentSceneId]);

  // 카메라 각도 수정 관련 상태
  const [selectedFacility, setSelectedFacility] =
    useState<TourFacilityResponse | null>(null);
  const [currentCameraAngles, setCurrentCameraAngles] = useState<{
    pitch: number;
    yaw: number;
    roll: number;
  } | null>(null);

  const [currentFov, setCurrentFov] = useState<number | null>(null);

  // 카메라 회전 동기화 전송
  const shareCameraRotation = useCallback(
    (pitch: number, yaw: number, roll: number, sceneId?: number) => {
      if (!isSharingMode || userMode !== UserRoleEnum.ADMIN) {
        return;
      }

      const activeSceneId = sceneId ?? currentSceneId;
      if (!activeSceneId) {
        return;
      }

      const cameraMsg: CameraRotationMessage = {
        type: WsEmitEventsEnum.CAMERA_ROTATION,
        data: {
          sceneId: activeSceneId,
          pitch,
          yaw,
          roll,
          userId: userIdRef.current,
          userRole: userMode,
          timestamp: Date.now(),
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };
      publish(cameraMsg);
    },
    [isSharingMode, userMode, publish, currentSceneId]
  );

  // 카메라 FOV 동기화 전송
  const shareCameraFov = useCallback(
    (fov: number) => {
      if (!isSharingMode || userMode !== UserRoleEnum.ADMIN) {
        return;
      }

      if (!currentSceneId) {
        return;
      }

      const fovMsg: CameraFovMessage = {
        type: WsEmitEventsEnum.CAMERA_FOV,
        data: {
          sceneId: currentSceneId,
          fov,
          userId: userIdRef.current,
          userRole: userMode,
          timestamp: Date.now(),
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };
      publish(fovMsg);
    },
    [isSharingMode, userMode, publish, currentSceneId]
  );

  // 포인터 이동 동기화 (관리자 → 방문자)
  const sharePointerMove = useCallback(
    (
      pointer: { x: number; y: number },
      viewport?: { width: number; height: number; aspectRatio: number },
      action: 'move' | 'click' = 'move'
    ) => {
      if (!isSharingMode || userMode !== UserRoleEnum.ADMIN) {
        return;
      }

      if (!sessionIdRef.current) {
        return;
      }

      const pointerMsg: PointerMoveMessage = {
        type: WsEmitEventsEnum.POINTER_MOVE,
        data: {
          consultationId: sessionIdRef.current,
          userType: 'admin',
          userRole: userMode,
          userId: userIdRef.current,
          context: '3d',
          pointer,
          action,
          ...(viewport && {
            viewport: {
              width: viewport.width,
              height: viewport.height,
              aspectRatio: viewport.aspectRatio,
            },
          }),
        },
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        userId: userIdRef.current,
      };

      publish(pointerMsg);
    },
    [isSharingMode, publish, userMode]
  );

  // 포인터 이벤트 (관리자 → 방문자) Traveler 콜백 기반
  const handleLocalPointerMove = useCallback(
    (pointer: { x: number; y: number }) => {
      if (userMode !== UserRoleEnum.ADMIN || !isSharingMode) {
        return;
      }

      pendingPointerRef.current = pointer;

      if (pointerSendRafRef.current === null) {
        pointerSendRafRef.current = window.requestAnimationFrame(() => {
          pointerSendRafRef.current = null;
          const pending = pendingPointerRef.current;
          if (!pending) return;
          sharePointerMove(pending, undefined, 'move');
        });
      }
    },
    [isSharingMode, sharePointerMove, userMode]
  );

  const handleLocalPointerClick = useCallback(
    (pointer: { x: number; y: number }) => {
      if (userMode !== UserRoleEnum.ADMIN || !isSharingMode) {
        return;
      }
      sharePointerMove(pointer, undefined, 'click');
    },
    [isSharingMode, sharePointerMove, userMode]
  );

  // requestAnimationFrame 정리
  useEffect(() => {
    return () => {
      if (pointerSendRafRef.current !== null) {
        window.cancelAnimationFrame(pointerSendRafRef.current);
      }
    };
  }, []);

  const handleSceneClick = useCallback(
    (id: number, title?: string, description?: string) => {
      // 첫 번째 인터랙션 감지
      if (!hasUserInteracted) {
        setHasUserInteracted(true);
      }

      shareSceneChange(id, title, description);
      setCurrentSceneId(id);
    },
    [shareSceneChange, hasUserInteracted, setHasUserInteracted]
  );

  const handleOnReloadTour = useCallback((_: TravelerTour) => {
    setIsTourLoaded(true);
  }, []);

  useEffect(() => {
    if (isTourLoaded) {
      if (!hasUserInteracted) {
        // 투어 로드 완료 후 약간의 지연을 두고 씬 이동 실행
        // 상담 데이터의 시작 씬으로 이동
        if (consultationData?.startFacilitySceneId) {
          moveToTargetSpot(Number(consultationData.startFacilitySceneId));
          setCurrentSceneId(Number(consultationData.startFacilitySceneId));
        }
      }
    }
  }, [isTourLoaded, getCurrentScene()]);

  const handleDrawModeToggle = (isDrawing: boolean) => {
    // 첫 번째 인터랙션 감지
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }

    // console.log('Toggling draw mode:', isDrawing);
    toggleDrawingMode();
    shareViewSync(isDrawing);
  };

  useEffect(() => {
    if (userMode === UserRoleEnum.ADMIN) {
      // 관리자는 수동으로 뷰포트 동기화 가능
      sendViewportSync();
    }
  }, [isSharingMode]);

  const handleOnRotationChange = useCallback(
    (pitch: number, yaw: number, roll: number, sceneId?: number) => {
      if (sceneId !== undefined && sceneId !== currentSceneId) {
        setCurrentSceneId(sceneId);
      }

      // console.log('Camera rotation changed:', { pitch, yaw, roll });

      // 카메라 각도 수정 모드일 때 현재 각도 저장
      setCurrentCameraAngles({ pitch, yaw, roll });

      // onCameraChange 콜백 호출 (fov가 있을 때만)
      if (onCameraChange && currentFov !== null) {
        onCameraChange({
          rotation: { pitch, yaw },
          fov: currentFov,
        });
      }

      // 관리자 모드이고 공유 모드가 켜져있을 때만 웹소켓으로 공유
      if (userMode === UserRoleEnum.ADMIN && isSharingMode) {
        shareCameraRotation(pitch, yaw, roll, sceneId);
      }
    },
    [
      userMode,
      isSharingMode,
      shareCameraRotation,
      onCameraChange,
      currentFov,
      currentSceneId,
    ]
  );

  const handleOnFovChange = useCallback(
    (fov: number) => {
      console.log('Camera FOV changed:', fov);

      // 현재 FOV 상태 업데이트
      setCurrentFov(fov);

      // onCameraChange 콜백 호출 (rotation이 있을 때만)
      if (onCameraChange && currentCameraAngles) {
        onCameraChange({
          rotation: {
            pitch: currentCameraAngles.pitch,
            yaw: currentCameraAngles.yaw,
          },
          fov: fov,
        });
      }

      // 관리자 모드이고 공유 모드가 켜져있을 때만 웹소켓으로 공유
      if (userMode === UserRoleEnum.ADMIN && isSharingMode) {
        shareCameraFov(fov);
      }
    },
    [
      userMode,
      isSharingMode,
      shareCameraFov,
      onCameraChange,
      currentCameraAngles,
    ]
  );

  useEffect(() => {
    setLoaded(true);
    setOnSceneClick(handleSceneClick);

    setOnRotationChange(handleOnRotationChange);
    setOnFovChange(handleOnFovChange);

    // 초기 사용자 역할에 따라 카메라 제어 설정
    setCameraControlEnabled(userMode === UserRoleEnum.ADMIN);
  }, [
    setLoaded,
    setOnSceneClick,
    handleSceneClick,
    handleOnRotationChange,
    handleOnFovChange,
    userMode,
    setCameraControlEnabled,
  ]);

  // 카메라 각도 수정 모드에 따라 카메라 제어 설정
  useEffect(() => {
    if (userMode === UserRoleEnum.ADMIN) {
      // 관리자는 항상 카메라 제어 가능, 카메라 각도 수정 모드일 때는 더욱 중요
      setCameraControlEnabled(true);
    }
  }, [isCameraEditMode, userMode, setCameraControlEnabled]);

  const {
    showIsCurrentLocation,
    showCameraAngleSaved,
    showCameraAngleSaveFailed,
  } = useToastMessages();

  // Tour facilities 데이터 가져오기
  const { data: facilities = [], refetch: refetchFacilities } =
    useGetAllTourFacilitiesByCdnId(props.tourCdnId);

  // 현재 씬에 해당하는 facility 찾기
  const findFacilityByCurrentScene = useCallback(() => {
    // const currentScene = getCurrentScene();
    if (!currentSceneId || !facilities.length) return null;

    return (
      facilities.find(
        (facility) => Number(facility.sceneId) === currentSceneId
      ) || null
    );
  }, [facilities, currentSceneId]);

  // 카메라 각도 저장
  const saveCameraAngles = useCallback(async () => {
    if (!selectedFacility || !currentCameraAngles) {
      console.log('Cannot save - missing data:', {
        selectedFacility: !!selectedFacility,
        currentCameraAngles: !!currentCameraAngles,
      });
      return;
    }

    const updateData = {
      cameraPosX: currentCameraAngles.pitch,
      cameraPosY: currentCameraAngles.yaw,
      cameraPosZ: currentCameraAngles.roll,
    };

    console.log('Saving camera angles:', {
      facility: selectedFacility,
      currentCameraAngles,
      updateData,
    });

    try {
      await updateTourFacility(
        selectedFacility.tourId,
        selectedFacility.id,
        updateData
      );

      await refetchFacilities();
      showCameraAngleSaved();
    } catch (error) {
      showCameraAngleSaveFailed();
      console.error('Failed to save camera angles:', error);
    }
  }, [
    selectedFacility,
    currentCameraAngles,
    showCameraAngleSaved,
    showCameraAngleSaveFailed,
  ]);

  // 카메라 각도 수정 모드 토글 핸들러
  const handleToggleCameraEditMode = useCallback(() => {
    if (isCameraEditMode) {
      // 카메라 각도 수정 모드를 종료하면서 저장
      if (selectedFacility && currentCameraAngles) {
        saveCameraAngles();
      }
      setSelectedFacility(null);
      setCurrentCameraAngles(null);
    } else {
      // 카메라 각도 수정 모드를 시작할 때 현재 씬의 facility 자동 선택
      const currentFacility = findFacilityByCurrentScene();
      const currentScene = getCurrentScene();

      if (currentFacility) {
        setSelectedFacility(currentFacility);
        // 현재 카메라 각도도 초기값으로 설정
        if (currentScene) {
          const initialAngles = {
            pitch: currentScene.pitch,
            yaw: currentScene.yaw,
            roll: currentScene.roll,
          };
          setCurrentCameraAngles(initialAngles);
        }
      }
    }
    toggleCameraEditMode();
  }, [
    isCameraEditMode,
    selectedFacility,
    currentCameraAngles,
    toggleCameraEditMode,
    saveCameraAngles,
    findFacilityByCurrentScene,
    getCurrentScene,
  ]);

  const handleClickLocation = (facility: TourFacilityResponse) => {
    const selectedSceneId = Number(facility.sceneId);
    const currentScene = facilities.find(
      (f) => Number(f.sceneId) === Number(facility.sceneId)
    )
      ? getCurrentScene()
      : null;

    // 현재 위치와 완전히 일치하는지 확인 (씬 ID + 카메라 각도)
    const isExactMatch = () => {
      if (!currentScene || selectedSceneId !== currentScene.id) {
        return false;
      }

      // 카메라 각도 정보가 없으면 씬 ID만 비교
      if (
        facility.cameraPosX === undefined ||
        facility.cameraPosY === undefined ||
        facility.cameraPosZ === undefined
      ) {
        return true;
      }

      // 카메라 각도 비교 (허용 오차: 0.1)
      const tolerance = 0.1;
      return (
        Math.abs(currentScene.pitch - facility.cameraPosX) < tolerance &&
        Math.abs(currentScene.yaw - facility.cameraPosY) < tolerance &&
        Math.abs(currentScene.roll - facility.cameraPosZ) < tolerance
      );
    };

    if (isExactMatch()) {
      if (isCameraEditMode) {
        // 카메라 각도 수정 모드일 때는 해당 시설을 선택
        setSelectedFacility(facility);
        return;
      }
      showIsCurrentLocation();
      return;
    }

    if (facility && selectedSceneId) {
      if (isCameraEditMode) {
        // 카메라 각도 수정 모드일 때는 해당 시설을 선택하고 씬 이동
        setSelectedFacility(facility);
      }

      // 씬으로 이동
      moveToTargetSpot(selectedSceneId);
      setCurrentSceneId(selectedSceneId);

      // facility에 저장된 카메라 각도가 있으면 해당 각도로 카메라 이동
      if (
        facility.cameraPosX !== undefined &&
        facility.cameraPosY !== undefined &&
        facility.cameraPosZ !== undefined
      ) {
        // console.log('Moving camera to saved angles:', {
        //   pitch: facility.cameraPosX,
        //   yaw: facility.cameraPosY,
        //   roll: facility.cameraPosZ,
        // });

        // 씬 이동 후 약간의 지연을 두고 카메라 각도 설정
        setTimeout(() => {
          setCameraRotation(
            facility.cameraPosX!,
            facility.cameraPosY!,
            facility.cameraPosZ!
          );
        }, 100);
      }
    }
  };

  if (props.tourCdnId === '' || !props.tourCdnId) return null;

  return (
    <div className='relative h-full w-full'>
      <div className='z-1 absolute left-0 top-0 h-full w-full'>
        {!isTourLoaded && <TourLoading />}
        <TravelerViewer
          tourResourceUrl={tourUrl}
          onReloadTour={handleOnReloadTour}
          onMarkerClick={handleTourMarkerClick}
          remotePointers={remotePointers}
          onLocalPointerMove={handleLocalPointerMove}
          onLocalPointerClick={handleLocalPointerClick}
        />
      </div>

      {isDrawingMode && (
        <div className='absolute left-0 top-0 z-10 h-full w-full'>
          <DrawingBoard
            publish={publish}
            drawingMessage={drawingMessage}
            onMessageProcessed={() => setDrawingMessage(null)}
            isConnected={isConnected}
            isDrawingMode={isDrawingMode}
            onStepBack={handleDrawModeToggle}
            isHidden={!showControls}
          />
        </div>
      )}

      {/* 사용자 정보 패널 미사용 정보이믈*/}
      {/* {props.openConsultationInfo && <TourInfo room={consultationData} />} */}

      {/* Toggle Button */}
      <button
        className='absolute bottom-4 left-1/2 z-[1300] -ml-6 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border-2 border-[#eee] bg-white bg-opacity-80 text-[#111] shadow-md transition-all duration-200 hover:bg-opacity-100'
        onClick={() => {
          setShowControls(!showControls);
          setShowPositionControls(false);
        }}
      >
        <ArrowDownIcon />
      </button>

      {/* Navigation Controls */}
      {!isDrawingMode && (
        <TourNavigationControls
          userRole={userMode}
          consultationId={props.consultationId}
          onEmitMessage={(event: string, message: string) => {
            if (client && client.connected) {
              client.emit(event, message);
            } else {
              console.warn('Socket not connected, cannot emit message');
            }
          }}
          userId={userIdRef.current}
          isDrawingMode={isDrawingMode!}
          toggleDrawMode={() => handleDrawModeToggle(!isDrawingMode)}
          runningTime={consultationData?.consultingStartedAt}
          isShow={showControls}
          tourId={props.tourCdnId}
          onClickLocation={handleClickLocation}
          showPositionControls={showPositionControls}
          onToggleShowPositionControls={() =>
            setShowPositionControls(!showPositionControls)
          }
          isCameraEditMode={isCameraEditMode!}
          onToggleCameraEditMode={handleToggleCameraEditMode}
          currentSceneId={currentSceneId}
        />
      )}
    </div>
  );
};
