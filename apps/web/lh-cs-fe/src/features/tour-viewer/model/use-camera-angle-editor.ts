import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';
import { updateTourFacility } from '@/shared/api/tour-facility-query-api';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

const CAMERA_APPLY_DELAY_MS = 100;
const CAMERA_TOLERANCE = 0.1;

interface UseCameraAngleEditorParams {
  facilities: TourFacilityResponse[];
  currentSceneId?: number;
  setCurrentSceneId: Dispatch<SetStateAction<number | undefined>>;
  getCurrentScene: () => {
    id: number;
    pitch: number;
    yaw: number;
    roll: number;
  };
  moveToTargetSpot: (sceneId: number) => void;
  setCameraRotation: (pitch: number, yaw: number, roll: number) => void;
  isCameraEditMode: boolean | null;
  toggleCameraEditMode: () => void;
  showIsCurrentLocation: () => void;
  refetchFacilities?: () => Promise<unknown>;
  showCameraAngleSaved: () => void;
  showCameraAngleSaveFailed: () => void;
  startTourFacilityId?: string;
}

interface UseCameraAngleEditorResult {
  shouldApplyCameraAngle: boolean;
  setShouldApplyCameraAngle: Dispatch<SetStateAction<boolean>>;
  handleClickLocation: (facility: TourFacilityResponse) => void;
  handleToggleCameraEditMode: () => void;
  handleRotationChange: (
    pitch: number,
    yaw: number,
    roll: number,
    sceneId?: number
  ) => void;
  handleInitCameraAngles: () => void;
}

export const useCameraAngleEditor = ({
  facilities,
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
  startTourFacilityId,
}: UseCameraAngleEditorParams): UseCameraAngleEditorResult => {
  const [selectedFacility, setSelectedFacility] =
    useState<TourFacilityResponse | null>(null);
  const [currentCameraAngles, setCurrentCameraAngles] = useState<{
    pitch: number;
    yaw: number;
    roll: number;
  } | null>(null);

  /**
   * 제목: Scene Point 클릭 시 camera angles 변경 버그 수정
   * 작성 일자: 2025.12.02
   * 작성인 : Jane

   * 버그 원인
    1. traveler.ts에서 moveToTargetSpot() 실행
      ↓
    2. #onCameraChange() 콜백 발생
      → handleRotationChange(pitch, yaw, roll, newSceneId)
      ↓
    3. React에서 currentSceneId 업데이트
      ↓
    4. useEffect 의존성 감지
      → handleInitCameraAngles() 재실행
      → setCameraRotation(facility.cameraPosX, facility.cameraPosY, facility.cameraPosZ)
      !! 사용자 각도 덮어써짐 !!

    * 해결책
      - Scene Point 클릭 시 플래그를 설정하여 handleInitCameraAngles()에서 카메라 각도 적용 여부 결정
      - 최초 진입 플래그 추가로 불필요한 초기화 방지
   */
  const [shouldApplyCameraAngle, setShouldApplyCameraAngle] = useState(false);

  const findFacilityByCurrentScene = useCallback(() => {
    if (!currentSceneId || !facilities.length) return null;
    return (
      facilities.find(
        (facility) => Number(facility.sceneId) === currentSceneId
      ) || null
    );
  }, [currentSceneId, facilities]);

  /**
   * 현재 Scene의 카메라 각도로 초기화
   * startTourFacilityId가 있으면 그 facility 찾기
   * 없으면 첫 번째 facility 사용
   */
  const handleInitCameraAngles = useCallback(() => {
    try {
      const currentScene = getCurrentScene();

      if (!currentScene) {
        setCurrentCameraAngles(null);
        return;
      }

      const currentFacility =
        facilities.filter(
          (facility) => Number(facility.sceneId) === currentSceneId
        ) || null;

      if (!currentFacility || currentFacility.length === 0) {
        setCurrentCameraAngles(null);
        return;
      }

      // startTourFacilityId가 있으면 정확한 facility 찾기
      let targetExactFacility = currentFacility.find((item) =>
        startTourFacilityId ? item.id === startTourFacilityId : false
      );

      // startTourFacilityId가 없거나 못 찾으면 첫 번째 facility 사용
      if (!targetExactFacility) {
        targetExactFacility = currentFacility[0];
      }

      const cameraPosX = targetExactFacility?.cameraPosX ?? 0;
      const cameraPosY = targetExactFacility?.cameraPosY ?? 0;
      const cameraPosZ = targetExactFacility?.cameraPosZ ?? 0;

      setCurrentCameraAngles({
        pitch: cameraPosX,
        yaw: cameraPosY,
        roll: cameraPosZ,
      });
      // 실제 카메라 각도 적용
      setCameraRotation(cameraPosX, cameraPosY, cameraPosZ);

      console.warn('📷 카메라 각도 초기화:', {
        sceneId: currentSceneId,
        facility: targetExactFacility?.facilityTitle,
        angle: { cameraPosX, cameraPosY, cameraPosZ },
      });
    } catch (error) {
      console.error('카메라 각도 초기화 실패:', error);
      setCurrentCameraAngles(null);
    }
  }, [
    getCurrentScene,
    setCameraRotation,
    currentSceneId,
    facilities,
    startTourFacilityId,
  ]);

  const saveCameraAngles = useCallback(async () => {
    if (!selectedFacility || !currentCameraAngles) return;

    const updateData = {
      cameraPosX: currentCameraAngles.pitch,
      cameraPosY: currentCameraAngles.yaw,
      cameraPosZ: currentCameraAngles.roll,
    };

    try {
      await updateTourFacility(
        selectedFacility.tourId,
        selectedFacility.id,
        updateData
      );
      if (refetchFacilities) {
        await refetchFacilities();
      }
      showCameraAngleSaved();
    } catch (error) {
      console.error('Failed to save camera angles:', error);
      showCameraAngleSaveFailed();
    }
  }, [
    currentCameraAngles,
    refetchFacilities,
    selectedFacility,
    showCameraAngleSaveFailed,
    showCameraAngleSaved,
  ]);

  const handleToggleCameraEditMode = useCallback(() => {
    if (isCameraEditMode) {
      if (selectedFacility && currentCameraAngles) {
        void saveCameraAngles();
      }
      setSelectedFacility(null);
      setCurrentCameraAngles(null);
    } else {
      const currentFacility = findFacilityByCurrentScene();
      if (currentFacility) {
        setSelectedFacility(currentFacility);
      }
    }
    toggleCameraEditMode();
  }, [
    currentCameraAngles,
    findFacilityByCurrentScene,
    isCameraEditMode,
    saveCameraAngles,
    selectedFacility,
    toggleCameraEditMode,
  ]);

  const handleClickLocation = useCallback(
    (facility: TourFacilityResponse) => {
      const selectedSceneId = Number(facility.sceneId);
      if (!selectedSceneId) return;

      const hasScene = facilities.some(
        (cur) => Number(cur.sceneId) === selectedSceneId
      );
      const currentScene = hasScene ? getCurrentScene() : null;

      const isExactMatch = () => {
        if (!currentScene || selectedSceneId !== currentScene.id) {
          return false;
        }

        if (
          facility.cameraPosX === undefined ||
          facility.cameraPosY === undefined ||
          facility.cameraPosZ === undefined
        ) {
          return true;
        }

        return (
          Math.abs(currentScene.pitch - facility.cameraPosX) <
            CAMERA_TOLERANCE &&
          Math.abs(currentScene.yaw - facility.cameraPosY) < CAMERA_TOLERANCE &&
          Math.abs(currentScene.roll - facility.cameraPosZ) < CAMERA_TOLERANCE
        );
      };

      if (isExactMatch()) {
        if (isCameraEditMode) {
          setSelectedFacility(facility);
        } else {
          showIsCurrentLocation();
        }
        return;
      }

      if (isCameraEditMode) {
        setSelectedFacility(facility);
      }

      moveToTargetSpot(selectedSceneId);
      setCurrentSceneId(selectedSceneId);
      setShouldApplyCameraAngle(true); // ← 플래그 ON

      if (
        facility.cameraPosX !== undefined &&
        facility.cameraPosY !== undefined &&
        facility.cameraPosZ !== undefined
      ) {
        setTimeout(() => {
          setCameraRotation(
            facility.cameraPosX!,
            facility.cameraPosY!,
            facility.cameraPosZ!
          );
        }, CAMERA_APPLY_DELAY_MS);
      }
    },
    [
      facilities,
      getCurrentScene,
      isCameraEditMode,
      moveToTargetSpot,
      setCameraRotation,
      setCurrentSceneId,
      showIsCurrentLocation,
    ]
  );

  const handleRotationChange = useCallback(
    (pitch: number, yaw: number, roll: number, sceneId?: number) => {
      if (sceneId !== undefined && sceneId !== currentSceneId) {
        setCurrentSceneId(sceneId);
        setShouldApplyCameraAngle(false); // ← 플래그 OFF
      }

      /**
       * 디버깅용 log 주석처리
       */
      // console.log(
      //   'sceneId:',
      //   sceneId,
      //   '최신 카메라 각도:',
      //   'camera_pos_x',
      //   pitch,
      //   'camera_pos_y',
      //   yaw,
      //   'camera_pos_z',
      //   roll
      // );
      setCurrentCameraAngles({ pitch, yaw, roll });
    },
    [currentSceneId, setCurrentSceneId]
  );

  return {
    shouldApplyCameraAngle,
    setShouldApplyCameraAngle,
    handleClickLocation,
    handleToggleCameraEditMode,
    handleRotationChange,
    handleInitCameraAngles,
  };
};
