import { AuthUser } from '@/features/auth';

import { useConsultationStatistics } from '@/features/statistics';
import {
  TourNavigationControls,
  useTourNavigationStore,
} from '@/features/tour-navigation';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import TourLoading from '@/shared/ui/tour-loading';
import {
  TourMarkerType,
  TravelerMarkerContent,
  TravelerTour,
  TravelerViewer,
  useViewer,
} from '@packages/traveler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetAllTourFacilitiesByCdnId } from '@/shared/api/hooks/tour-facilities-hooks';
import { SelfCheckNavigation } from '@/features/self-check-tour';
import { useSceneChangeEmitter } from '../model/use-scene-change-emitter';
import { useDrawingModeAnalytics } from '../model/use-drawing-mode-analytics';
import { useMarkerPopupLogger } from '../model/use-marker-popup-logger';
import { useRotationChangeListener } from '../model/use-rotation-change-listener';
import { useInitialSceneMover } from '../model/use-initial-scene-mover';
import { useCameraAngleEditor } from '../model/use-camera-angle-editor';

const TARGET_VERSION_PATH = 'latest.json';

// Tour Viewer Component
// Tour 이동 및 SceneId 이동 동기화 + WebSocket 중앙화
// 사용자 모드일때는 마스터 뷰포트에 자동 동기화
interface SelfCheckTourViewerProps {
  tourCdnId: string;
  profileData?: AuthUser | null;
  initialSceneId?: number; // 초기 씬 ID
  onCameraChange?: (camera: {
    rotation: { pitch: number; yaw: number };
    fov: number;
  }) => void;
  onSceneChange?: (sceneId: number) => void; // 씬 변경 콜백
  onMarkerClick?: (
    markerId: number,
    markerType?: TourMarkerType,
    markerContent?: TravelerMarkerContent
  ) => void;
  openConsultationInfo?: boolean; // 상담실 정보 패널 열기 상태
}

export const SelfCheckTourViewer = (props: SelfCheckTourViewerProps) => {
  const {
    tourCdnId,
    profileData = null,
    initialSceneId,
    onSceneChange,
    onMarkerClick,
  } = props;

  const [isTourLoaded, setIsTourLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [currentSceneId, setCurrentSceneId] = useState<number | undefined>();
  const [showPositionControls, setShowPositionControls] = useState(false);

  const {
    isDrawingMode,
    toggleDrawingMode,
    userMode,
    isCameraEditMode,
    toggleCameraEditMode,
    // setIsSelfCheckMode,
  } = useTourNavigationStore();

  const { data: facilities = [], refetch: refetchFacilities } =
    useGetAllTourFacilitiesByCdnId(tourCdnId);

  const isTourCdnIdMissing = !tourCdnId;

  const {
    moveToTargetSpot,
    setCameraRotation,
    getCurrentScene,
    getMarkerContent,
    setOnRotationChange,
  } = useViewer();

  const userIdRef = useRef<string>(`user_${Date.now()}`);

  useSceneChangeEmitter(currentSceneId, onSceneChange);

  const { logDrawingModeToggle, logPopupToggle } = useConsultationStatistics();

  useDrawingModeAnalytics({
    isDrawingMode,
    currentSceneId,
    userId: userIdRef.current,
    logDrawingModeToggle,
  });

  const tourUrl = useMemo(() => {
    if (!tourCdnId) {
      return '';
    }
    return `${import.meta.env.VITE_TOUR_CDN_URL}/backstage/tours/${tourCdnId}/json/${TARGET_VERSION_PATH}`;
  }, [tourCdnId]);

  const handleOnReloadTour = useCallback((_: TravelerTour) => {
    setIsTourLoaded(true);
  }, []);

  const {
    showIsCurrentLocation,
    showCameraAngleSaved,
    showCameraAngleSaveFailed,
  } = useToastMessages();

  const {
    handleClickLocation,
    handleToggleCameraEditMode,
    handleRotationChange,
    handleInitCameraAngles,
    shouldApplyCameraAngle,
    setShouldApplyCameraAngle,
  } = useCameraAngleEditor({
    facilities: facilities,
    currentSceneId,
    setCurrentSceneId,
    getCurrentScene,
    moveToTargetSpot,
    setCameraRotation,
    isCameraEditMode,
    toggleCameraEditMode,
    showIsCurrentLocation,
    refetchFacilities,
    showCameraAngleSaved,
    showCameraAngleSaveFailed,
  });

  // 카메라 각도 초기화 - Tour 및 Scene 준비 완료 후
  useEffect(() => {
    if (isTourLoaded && facilities.length > 0 && currentSceneId) {
      if (shouldApplyCameraAngle) {
        handleInitCameraAngles(); // facility angle 적용
        setShouldApplyCameraAngle(false); // 한 번만 실행
      }
    }
  }, [isTourLoaded, facilities.length, currentSceneId, shouldApplyCameraAngle]);

  useInitialSceneMover({
    isTourLoaded,
    startSceneId: undefined,
    fallbackSceneId: initialSceneId,
    moveToTargetSpot,
    setCurrentSceneId,
  });

  useRotationChangeListener(setOnRotationChange, handleRotationChange);

  const markerContent = getMarkerContent();

  useMarkerPopupLogger({
    markerContent,
    profileId: profileData?.id,
    logPopupToggle,
  });

  const handleDrawModeToggle = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    toggleDrawingMode();
  }, [hasUserInteracted, toggleDrawingMode]);

  if (isTourCdnIdMissing || !tourUrl) {
    return null;
  }

  return (
    <>
      {!isTourLoaded && <TourLoading />}

      <div className='z-1 absolute left-0 top-0 h-full w-full'>
        <TravelerViewer
          tourResourceUrl={tourUrl}
          onReloadTour={handleOnReloadTour}
          onMarkerClick={onMarkerClick}
        />
      </div>

      <SelfCheckNavigation
        tourCdnId={tourCdnId}
        showControls={showControls}
        handleClickLocation={handleClickLocation}
        currentSceneId={currentSceneId}
        onClick={() => setShowControls(!showControls)}
      />

      {!isDrawingMode && (
        <TourNavigationControls
          userRole={userMode}
          onEmitMessage={() => {}}
          userId={userIdRef.current}
          isDrawingMode={isDrawingMode!}
          toggleDrawMode={handleDrawModeToggle}
          isShow={showControls}
          tourId={tourCdnId}
          onClickLocation={handleClickLocation}
          isCameraEditMode={isCameraEditMode!}
          onToggleCameraEditMode={handleToggleCameraEditMode}
          currentSceneId={currentSceneId}
          options={{
            exitButton: { show: true, confirmBeforeExit: false },
            locationControl: { show: true },
            cameraSettings: {
              show: userMode === UserRoleEnum.ADMIN,
              disabled: false,
            },
            drawingTool: {
              show: userMode === UserRoleEnum.ADMIN,
              disabled: false,
            },
            operationTime: { show: true, label: '운영 시간' },
          }}
          showPositionControls={showPositionControls}
          onToggleShowPositionControls={() =>
            setShowPositionControls(!showPositionControls)
          }
        />
      )}
    </>
  );
};
