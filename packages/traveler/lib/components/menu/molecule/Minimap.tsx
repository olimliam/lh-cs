/** @jsxImportSource @emotion/react */
import { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import Panzoom, { PanzoomEventDetail, PanzoomObject } from '@panzoom/panzoom';
import { minBy, uniq } from 'lodash';
import cx from 'classnames';

import {
  ControlBarStyle,
  ControlBarStyleConst,
} from '../../../types/controller-bar';
import { useDeviceDetector } from '../../../hooks/useDeviceDetector';
import { Direction } from '../../../types/direction';
import Here from './Here';
import { useMinimap } from '../../../hooks/useMinimap';
import { tourYawToO3DYaw } from '../../../utils/o3d.util';
import { useViewer } from '../../../contexts/ViewerContext';
import { useToolbar } from '../../../contexts/ToolBarContext';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  gap: 16px;
`;

const Body = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const BottomAction = styled.div<{ barStyle: ControlBarStyle }>`
  margin-top: auto;
  padding: 4px;
  gap: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(15, 15, 15, 0.9);
  border: 1px solid white;
  border-radius: 9999px;
  ${({ barStyle }) => {
    if (
      barStyle === ControlBarStyleConst.SQUARE_BLACK ||
      barStyle === ControlBarStyleConst.CLEAR_WHITE
    )
      return css`
        border: 0;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.3);
      `;
    if (barStyle === ControlBarStyleConst.ROUND_WHITE)
      return css`
        border: 0;
        background-color: rgba(0, 0, 0, 0.3);
      `;
  }}
`;

const ZoomButton = styled.a`
  width: 24px;
  height: 24px;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface MinimapProps {
  isPin?: boolean;
  width: number;
}

const Minimap = (props: MinimapProps, ref: React.Ref<HTMLDivElement>) => {
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isClick, setClick] = useState<boolean>(false);
  const [selected, setSelected] = useState<number[]>([]);

  const [scale, setScale] = useState<number>(1);

  const { getMinimapPosition } = useMinimap();

  const { isPinnedMap, barStyle, setIsPinnedMap, setCurrentMenu } =
    useToolbar();
  const {
    state,
    getCurrentScene,
    getCurrentMinimap,
    setCurrentScene,
    setViewSwitchParam,
  } = useViewer();

  const currentMinimap = getCurrentMinimap();
  const currentScene = getCurrentScene();

  const panzoom = useRef<PanzoomObject | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapContentEl = useRef<HTMLDivElement>(null);

  const { isTablet } = useDeviceDetector();

  const scenePosition = useMemo(() => {
    return state.tour.scenes
      .map((scene) => {
        return {
          ...getMinimapPosition(scene.x, scene.y),
          id: scene.id,
        };
      })
      .filter((x) => x);
  }, [state.tour.scenes.map((x) => x.id)]);

  const ratio = currentMinimap
    ? Number(
        (
          Math.max(currentMinimap.width, currentMinimap.height) /
          Math.min(currentMinimap.width, currentMinimap.height)
        ).toFixed(2)
      )
    : 1;

  const handleSceneClick = (sceneID: number) => {
    if (isClick) {
      const scene = state.tour.scenes.find((z) => z.id == sceneID);
      if (scene) {
        setCurrentScene(sceneID, {
          init: true,
          direction: Direction.UNAVAILABLE,
        });
      }
    }
    setSelected(uniq([...selected, sceneID]));
  };

  const handleGroundClick = (e: React.MouseEvent) => {
    if (e.target == mapContentEl.current) {
      const rect = mapContentEl.current?.getBoundingClientRect();
      if (rect) {
        const y = e.pageY - rect.y;
        const x = e.pageX - rect.x;

        const mx = (x / (mapContentEl.current?.clientWidth || 0)) * 100;
        const my = (y / (mapContentEl.current?.clientHeight || 0)) * 100;

        const result = minBy(scenePosition, (x) => {
          const dx = (x?.x || 0) - mx / scale;
          const dy = (x?.y || 0) - my / scale;

          return Math.sqrt(
            Math.abs(Math.pow(dx, 2)) + Math.abs(Math.pow(dy, 2))
          );
        });
        if (result) {
          handleSceneClick(result.id);
        }
      }
    }
  };

  const handleZoom = (val: number) => {
    if (val > 0) {
      panzoom.current?.zoomIn();
    } else {
      panzoom.current?.zoomOut();
    }
  };

  const handleOrigin = () => {
    setViewSwitchParam({
      yaw: tourYawToO3DYaw(currentScene.yaw, currentScene.offset),
      pitch: currentScene.pitch,
      fov: null,
    });
  };

  const handleZoomReset = () => {
    panzoom.current?.reset();
  };

  useEffect(() => {
    if (mapEl.current) {
      const handleZoom = (event: CustomEvent<PanzoomEventDetail>) => {
        setScale(event.detail.scale);
      };

      panzoom.current = Panzoom(mapEl.current, {
        cursor: 'default',
        minScale: 0.5,
        maxScale: 4,
        contain: 'outside',
      });

      mapEl.current.addEventListener(
        'panzoomzoom',
        handleZoom as EventListener
      );

      return () => {
        mapEl.current?.removeEventListener(
          'panzoomzoom',
          handleZoom as EventListener
        );
        panzoom.current?.destroy();
      };
    }
  }, [mapEl]);

  useEffect(() => {
    if (panzoom.current) {
      const downHandler = () => {
        if (panzoom.current) {
          setClick(false);
          setPan(panzoom.current.getPan());
        }
      };

      const moveHandler = () => {
        if (panzoom.current) {
          const currentPan = panzoom.current.getPan();
          if (!(pan.x == currentPan.x && pan.y == currentPan.y)) {
            // TODO : 툴팁 움직임 제어 필요
          }
        }
      };

      const upHandler = () => {
        if (panzoom.current) {
          const currentPan = panzoom.current.getPan();
          if ((pan.x == currentPan.x && pan.y == currentPan.y) || isTablet) {
            setClick(true);
          } else {
            setClick(false);
          }
          setPan(panzoom.current.getPan());
        }
      };

      mapEl.current?.addEventListener('pointerdown', downHandler);
      document.addEventListener('pointerup', upHandler);
      document.addEventListener('pointermove', moveHandler);
      mapEl.current?.addEventListener('wheel', panzoom.current.zoomWithWheel);

      return () => {
        mapEl.current?.addEventListener(
          'wheel',
          panzoom.current!.zoomWithWheel
        );
        mapEl.current?.removeEventListener('pointerdown', downHandler);
        document.removeEventListener('pointermove', moveHandler);
        document.removeEventListener('pointerup', upHandler);
      };
    }
  }, [panzoom, pan]);

  return (
    <>
      {currentMinimap && currentMinimap.id && currentMinimap.url && (
        <Root ref={ref}>
          <Body>
            <div
              ref={mapEl}
              className='mx-auto flex h-full w-full items-center justify-center'
              style={{
                aspectRatio: ratio + '',
              }}
            >
              <div
                ref={mapContentEl}
                className='h-full cursor-pointer bg-contain bg-center bg-no-repeat'
                style={{
                  width: props.width + 'px',
                  aspectRatio: ratio + '',
                  backgroundImage: `url('${currentMinimap.url}')`,
                }}
                onClick={(e) => handleGroundClick(e)}
              />
              <Here mapScale={scale} />
            </div>
          </Body>
          <div className='flex flex-col justify-between'>
            {props.isPin && (
              <button
                className='p-1'
                onClick={() => {
                  setIsPinnedMap(!isPinnedMap);
                  setCurrentMenu(null);
                }}
              >
                <i
                  className={cx(
                    'ic-pin text-ic-md',
                    barStyle === ControlBarStyleConst.ROUND_WHITE
                      ? 'text-gray-800'
                      : 'text-white'
                  )}
                />
              </button>
            )}
            {!props.isPin && (
              <button onClick={() => setIsPinnedMap(false)}>
                <i
                  className={cx(
                    'ic-close text-ic-md',
                    barStyle === ControlBarStyleConst.ROUND_WHITE
                      ? 'text-gray-800'
                      : 'text-white'
                  )}
                />
              </button>
            )}

            <BottomAction barStyle={barStyle}>
              {!isTablet && (
                <>
                  <ZoomButton onClick={() => handleZoom(1)}>
                    <i className='ic-plus text-ic-xs text-white' />
                  </ZoomButton>
                  <ZoomButton onClick={() => handleZoom(-1)}>
                    <i className='ic-minus text-ic-xs text-white' />
                  </ZoomButton>
                </>
              )}
              {isTablet && (
                <ZoomButton
                  className='!h-8 !w-8'
                  onClick={() => {
                    handleOrigin();
                    handleZoomReset();
                  }}
                >
                  <i className='ic-focus text-ic-md text-white' />
                </ZoomButton>
              )}
            </BottomAction>
          </div>
        </Root>
      )}
    </>
  );
};

export default forwardRef(Minimap);
