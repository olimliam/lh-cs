import { AuthUser } from '@/features/auth';
import { useConsultationFullDetailById } from '@/features/consultation/api/consultation-hooks';
import DrawingBoard from '@/features/drawer/ui/drawing-board';
import { useConsultationStatistics } from '@/features/statistics';
import {
  TourNavigationControls,
  useTourNavigationStore,
} from '@/features/tour-navigation';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { ArrowDownIcon } from '@/shared/ui/icons/arrow-down-icon';
import TourLoading from '@/shared/ui/tour-loading';
import {
  TourMarkerType,
  TravelerMarkerContent,
  TravelerTour,
  TravelerViewer,
  useViewer,
} from '@packages/traveler';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TourInfo } from './tour-info';
import { useSceneChangeEmitter } from '../model/use-scene-change-emitter';
import { useDrawingModeAnalytics } from '../model/use-drawing-mode-analytics';
import { useMarkerPopupLogger } from '../model/use-marker-popup-logger';
import { useRotationChangeListener } from '../model/use-rotation-change-listener';
import { useInitialSceneMover } from '../model/use-initial-scene-mover';
import { useCameraAngleEditor } from '../model/use-camera-angle-editor';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';
import { TourDataByFullInfo } from '@/features/consultation/model/consultation.types';
import { SelectSquareMeterPopup } from './select-squaremeter-popup';
import { useMutation } from '@tanstack/react-query';
import { getTourById } from '@/shared/api/tour-query-api';
import { useGetAllTours } from '@/shared/api/hooks/tour-hooks';
import { getAllTourFacilitiesByCdnId } from '@/shared/api/tour-facility-query-api';
import { TourResponse } from '@/shared/model/tour.dto';

const TARGET_VERSION_PATH = 'latest.json';

// Tour Viewer Component
// Tour 이동 및 SceneId 이동 동기화 + WebSocket 중앙화
// 사용자 모드일때는 마스터 뷰포트에 자동 동기화
interface SimpleTourViewerProps {
  tourCdnId?: string;
  profileData?: AuthUser | null;
  consultationId?: string;
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
export interface TourInfoData {
  roomId: string;
  consultationCode: string;
  squareMeters: number;
  enterCode?: string;
  tourTitle: string;
  facilityTitle: string | null;
}

export const SimpleTourViewer = (props: SimpleTourViewerProps) => {
  const {
    profileData = null,
    consultationId,
    initialSceneId,
    onSceneChange,
    onMarkerClick,
  } = props;

  const {
    isDrawingMode,
    toggleDrawingMode,
    userMode,
    isCameraEditMode,
    toggleCameraEditMode,
  } = useTourNavigationStore();

  const [isTourLoaded, setIsTourLoaded] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [drawingMessage, setDrawingMessage] = useState<string | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<number | undefined>();
  const [showPositionControls, setShowPositionControls] = useState(false);
  const [targetTourData, setTargetTourData] = useState<
    TourDataByFullInfo | TourResponse | null
  >(null);
  const [targetFacilityList, setTargetFacilityList] = useState<
    TourFacilityResponse[]
  >([]);
  const [startTourFacilityId, setStartTourFacilityId] = useState<
    string | undefined
  >();
  const [tourInfoData, setTourInfoData] = useState<TourInfoData | null>(null);

  //데이터 호출
  const { data: fullDataByConsultationId } = useConsultationFullDetailById(
    consultationId || ''
  );
  const { data: toursData } = useGetAllTours();
  const { mutate: fetchTourData, data: targetTourDataById } = useMutation({
    mutationFn: getTourById,
  });
  const { mutate: fetchTourFacilities, data: tourFacilitiesData } = useMutation(
    {
      mutationFn: (tourCdnId: string) => {
        return getAllTourFacilitiesByCdnId(tourCdnId);
      },
    }
  );
  const isTourCdnIdMissing = !targetTourData?.tourCdnId;

  // init data ----------------------------------------------------------
  useEffect(() => {
    if (fullDataByConsultationId) {
      setStartTourFacilityId(
        fullDataByConsultationId.startTourFacilityId || undefined
      );
      setTargetTourData(fullDataByConsultationId.tour);
      setTargetFacilityList(fullDataByConsultationId.tourFacilities);
      setTourInfoData({
        roomId: fullDataByConsultationId.id,
        consultationCode: fullDataByConsultationId.consultationCode,
        squareMeters: fullDataByConsultationId.squareMeters,
        enterCode: fullDataByConsultationId.enterCode,
        tourTitle: fullDataByConsultationId.tourTitle,
        facilityTitle: fullDataByConsultationId.facilityTitle,
      });
      setFormData((prev) => {
        return { ...prev, targetTourId: fullDataByConsultationId.tour.id };
      });
    }
  }, [fullDataByConsultationId]);

  // setting camera & scene control hooks ------------------------------
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
    consultationId,
    userId: userIdRef.current,
    logDrawingModeToggle,
  });

  const tourUrl = useMemo(() => {
    if (!targetTourData?.tourCdnId) {
      return '';
    }
    return `${import.meta.env.VITE_TOUR_CDN_URL}/backstage/tours/${targetTourData.tourCdnId}/json/${TARGET_VERSION_PATH}`;
  }, [targetTourData?.tourCdnId]);

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
    facilities: targetFacilityList,
    currentSceneId,
    setCurrentSceneId,
    getCurrentScene,
    moveToTargetSpot,
    setCameraRotation,
    isCameraEditMode,
    toggleCameraEditMode,
    showIsCurrentLocation,
    showCameraAngleSaved,
    showCameraAngleSaveFailed,
    startTourFacilityId,
  });

  /**
   * 제목: Scene Point 클릭 시 camera angles 변경 버그 수정
   * 작성 일자: 2025.12.02
   * 작성인 : Jane

   * 카메라 각도 초기화 - 최초 진입 시 (currentSceneId 변경 감지)
   */
  const isFirstTimeRef = useRef(true);

  useEffect(() => {
    if (
      isTourLoaded &&
      targetFacilityList.length > 0 &&
      currentSceneId &&
      startTourFacilityId
    ) {
      // 최초 진입: currentSceneId가 처음 설정될 때 (useInitialSceneMover 이후)
      if (isFirstTimeRef.current) {
        handleInitCameraAngles();
        isFirstTimeRef.current = false;
      } else if (shouldApplyCameraAngle) {
        // 이후: LocationItem 클릭할 때만 handleInitCameraAngles() 실행
        handleInitCameraAngles();
        setShouldApplyCameraAngle(false);
      }
    }
  }, [
    isTourLoaded,
    targetFacilityList.length,
    currentSceneId,
    startTourFacilityId,
    handleInitCameraAngles,
    shouldApplyCameraAngle,
    setShouldApplyCameraAngle,
  ]);

  useInitialSceneMover({
    isTourLoaded,
    startSceneId: fullDataByConsultationId?.startFacilitySceneId
      ? Number(fullDataByConsultationId.startFacilitySceneId)
      : undefined,
    fallbackSceneId: initialSceneId,
    moveToTargetSpot,
    setCurrentSceneId,
  });

  useRotationChangeListener(setOnRotationChange, handleRotationChange);

  const markerContent = getMarkerContent();

  useMarkerPopupLogger({
    markerContent,
    consultationId,
    profileId: profileData?.id,
    logPopupToggle,
  });

  const handleDrawModeToggle = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    toggleDrawingMode();
  }, [hasUserInteracted, toggleDrawingMode]);

  // change square meter --------------------------------------------------
  const [openSelectFacilityPopup, setOpenSelectFacilityPopup] = useState(false);
  const [formData, setFormData] = useState<{ targetTourId: string }>({
    targetTourId: '',
  });

  const handleRadioChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleFetchTourData = () => {
    const filteredTourCdnId = toursData?.find(
      (tour) => tour.id === formData.targetTourId
    )?.tourCdnId;

    if (filteredTourCdnId) {
      fetchTourData(formData.targetTourId);
      fetchTourFacilities(filteredTourCdnId);
      setOpenSelectFacilityPopup(false);
    }
  };

  useEffect(() => {
    if (!tourFacilitiesData || targetTourDataById === undefined) return;

    setTargetTourData(targetTourDataById);
    setTargetFacilityList(tourFacilitiesData);

    if (tourInfoData) {
      setTourInfoData({
        ...tourInfoData,
        squareMeters: targetTourDataById.squareMeters,
        facilityTitle: null,
      });
    }
  }, [targetTourDataById, tourFacilitiesData]);
  // --------------------------------------------------------------------

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
      {isDrawingMode && (
        <div className='absolute left-0 top-0 z-10 h-full w-full'>
          <DrawingBoard
            publish={() => {}}
            drawingMessage={drawingMessage}
            onMessageProcessed={() => setDrawingMessage(null)}
            isConnected={false}
            isDrawingMode={isDrawingMode}
            onStepBack={handleDrawModeToggle}
            isHidden={!showControls}
            userMode={userMode}
          />
        </div>
      )}

      {userMode === UserRoleEnum.ADMIN && props.openConsultationInfo && (
        <TourInfo
          room={tourInfoData}
          handleOpenFacilityPopup={() => setOpenSelectFacilityPopup(true)}
        />
      )}

      <div
        className='absolute bottom-4 left-1/2 z-[1300] -ml-6 flex h-[28px] w-[28px] cursor-pointer items-center justify-center rounded-full border-2 border-[#eee] bg-white bg-opacity-80 text-[#111] shadow-md transition-all duration-200 hover:bg-opacity-100'
        onClick={() => {
          setShowControls(!showControls);
          setShowPositionControls(false);
        }}
      >
        <div
          style={{
            transform: showControls ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        >
          <ArrowDownIcon />
        </div>
      </div>

      {!isDrawingMode && (
        <TourNavigationControls
          userRole={userMode}
          consultationId={consultationId}
          onEmitMessage={() => {}}
          userId={userIdRef.current}
          isDrawingMode={isDrawingMode!}
          toggleDrawMode={handleDrawModeToggle}
          runningTime={fullDataByConsultationId?.createdAt}
          isShow={showControls}
          tourId={targetTourData?.tourCdnId}
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

      {openSelectFacilityPopup && (
        <SelectSquareMeterPopup
          isOpen={openSelectFacilityPopup}
          onClose={() => setOpenSelectFacilityPopup(false)}
          currentSquareMeter={targetTourData?.squareMeters || 0}
          changeTourId={formData.targetTourId}
          toursData={toursData || []}
          onChange={handleRadioChange}
          handleFetchTourData={handleFetchTourData}
        />
      )}
    </>
  );
};
