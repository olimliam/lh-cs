import { useCallback, useEffect, useRef, useState } from 'react';
import './traveler-viewer.css';
import '../../index.css';

import { SUPPORTED_LANG_CODE } from '../../enums/lang-code.enum';
import getTraveler from '../../core/traveler';
import { useViewer } from '../../contexts/ViewerContext';
import { useToolbar } from '../../contexts/ToolBarContext';
import { TravelerMarkerContent, TravelerTour } from '../../types/traveler-tour';
import { Direction } from '../../types/direction';
import { ControlBarPositionConst, SpaceInfo } from '../../types/controller-bar';
// import { O3DModel } from '../../models/o3d';
// import { getModelSize2D } from '../../utils';
import ControllerBar from '../controller-bar/organization/ControllerBar';
import PinnedMinimap from '../menu/molecule/PinnedMinimap';
import PopUp from '../popup/popup';
import { TourMarkerType } from '../../main';
import { RemotePointerState } from '../../types/traveler';

export interface SceneMetaInfo {
  id: number;
  title: string;
  desc?: string;
  isSelection?: boolean;
  thumbnailUrl?: string;
}

export interface TravelerViewerProps {
  spaceInfo?: SpaceInfo;
  tourResourceUrl: string;
  onReloadTour: (tourData: TravelerTour) => void;
  onMarkerClick?: (
    markerId: number,
    markerType?: TourMarkerType,
    markerContent?: TravelerMarkerContent
  ) => void;
  remotePointers?: RemotePointerState[];
  onLocalPointerMove?: (norm: { x: number; y: number }) => void;
  onLocalPointerClick?: (norm: { x: number; y: number }) => void;
}

/**
 * Traveler 뷰어 컴포넌트
 * 가상 투어를 표시하는 컴포넌트입니다.
 */
export const TravelerViewer = ({
  spaceInfo,
  tourResourceUrl,
  onReloadTour,
  onMarkerClick,
  remotePointers,
  onLocalPointerMove,
  onLocalPointerClick,
}: TravelerViewerProps) => {
  const {
    initPlayer,
    setCurrentScene,
    setViewParam,
    setCurrentSceneID,
    setMarkerContent,
    state: viewerState,
  } = useViewer();

  const { isPinnedMap, setBarPosition } = useToolbar();

  const parentElement = useRef<HTMLDivElement | null>(null);

  const [tourData, setTourData] = useState<TravelerTour | null>(null);

  const loadCompleteFunction = async (tourData: TravelerTour) => {
    initPlayer(tourData, tourData.startingSceneID);
    setCurrentScene(tourData.startingSceneID!, {
      init: true,
      direction: Direction.UNAVAILABLE,
    });
    setTourData(tourData);

    onReloadTour(tourData);
  };

  const handleMarkerClick = useCallback(
    (
      markerId: number,
      _markerName?: string,
      _markerDescription?: string,
      contentType?: TourMarkerType,
      contentData?: TravelerMarkerContent
    ) => {
      console.log('handleMarkerClick!!!!!', markerId, contentType, contentData);
      const marker = tourData?.markers.find((m) => m.id === markerId);

      if (marker) {
        setMarkerContent({
          markerId: marker.id,
          type: marker.contentType,
          option: marker.content,
        });
      } else if (contentType || contentData) {
        setMarkerContent({
          markerId,
          type: contentType ?? null,
          option: contentData ?? null,
        });
      }

      // 외부에서 마커 클릭 이벤트를 처리할 수 있도록 콜백 호출
      // onLocalPointerClick할때도 한번더 랜더링
      if (onMarkerClick) {
        onMarkerClick(
          markerId,
          marker?.contentType ?? contentType,
          marker?.content ?? contentData
        );
      }
    },
    [tourData, setMarkerContent, onMarkerClick]
  );

  // 초기화는 한 번만 수행
  useEffect(() => {
    const travelerInstance = getTraveler();
    travelerInstance.reset(
      parentElement!.current as HTMLElement,
      '',
      '',
      'ko' as SUPPORTED_LANG_CODE
    );

    travelerInstance.setMoveTypeWarp(true);
    setBarPosition(ControlBarPositionConst.BOTTOM);

    travelerInstance.setOnFovChange((fov: number) => {
      setViewParam({
        ...viewerState.viewParam,
        fov: fov,
      });
    });

    travelerInstance.setOnRotationChange((pitch, yaw, _roll, _sceneId) => {
      setViewParam({
        ...viewerState.viewParam,
        yaw: yaw,
        pitch: pitch,
      });
    });

    travelerInstance.setOnSceneClick((id) => {
      setCurrentSceneID(id);
    });

    travelerInstance.setOnLocalPointerMove(onLocalPointerMove);
    travelerInstance.setOnLocalPointerClick(onLocalPointerClick);

    return () => {
      travelerInstance.destroy();
    };
  }, []);

  useEffect(() => {
    const travelerInstance = getTraveler();
    travelerInstance.setOnLocalPointerMove(onLocalPointerMove);
    travelerInstance.setOnLocalPointerClick(onLocalPointerClick);
  }, [onLocalPointerMove, onLocalPointerClick]);

  useEffect(() => {
    const travelerInstance = getTraveler();
    travelerInstance.setRemotePointers(remotePointers || []);
  }, [remotePointers]);

  useEffect(() => {
    // 마커 클릭 이벤트 설정
    getTraveler().setOnMarkerClick(handleMarkerClick);
  }, [handleMarkerClick]);

  // tourResourceUrl이 변경될 때만 투어 리로드
  useEffect(() => {
    if (tourResourceUrl) {
      const travelerInstance = getTraveler();
      travelerInstance.reloadTour(tourResourceUrl, loadCompleteFunction);
    }
  }, [tourResourceUrl, onReloadTour]);

  useEffect(() => {
    // 초기 로드 시가 아닌 경우에만 씬 이동 (currentSceneID가 0이 아닐 때)
    if (viewerState.currentSceneID && viewerState.currentSceneID !== 0) {
      getTraveler().moveToTargetSpot(viewerState.currentSceneID, {
        isOriginalRotation: true,
      });
    }
  }, [viewerState.currentSceneID]);

  useEffect(() => {
    console.log('viewerState:===========', viewerState);
  }, [viewerState]);

  return (
    <>
      {spaceInfo && (
        <ControllerBar
          option={spaceInfo?.control}
          tourList={spaceInfo?.shortcutList}
          onChangeTour={() => {}}
        />
      )}

      {isPinnedMap && <PinnedMinimap />}
      <div
        ref={parentElement}
        className={`traveler-viewer`}
        data-testid='traveler-viewer'
      />
      {viewerState.markerContent.option && <PopUp />}
    </>
  );
};
