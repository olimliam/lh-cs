/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { useMinimap } from '../../../hooks/useMinimap';
import { useViewer } from '../../../contexts/ViewerContext';
import { radToDeg, trimDeg } from '../../../utils/o3d.util';

import currentpointSvg from '../../../assets/svgs/icon-player-currentpoint-df.svg';
import currentareaSvg from '../../../assets/svgs/icon-player-currentarea-df.svg';

const HerePoint = styled.div`
  position: absolute;
  cursor: pointer;
  z-index: 20;
  width: 12px;
  height: 12px;
  margin-top: -6px;
  margin-left: -6px;
  // background-image: url('../../../assets/svgs/icon-player-currentpoint-df.svg');
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
`;

const HereDeg = styled.div`
  position: absolute;
  z-index: 15;
  width: 64px;
  height: 24px;
  margin-top: -28px;
  margin-left: -32px;
  // background-image: url('../../../assets/svgs/icon-player-currentarea-df.svg');
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  transform-origin: center bottom;
`;

function Here(props: { mapScale: number }) {
  const { getMinimapPosition } = useMinimap();
  const { getCurrentScene, state } = useViewer();

  const currentScene = getCurrentScene();
  const scenePosition = currentScene
    ? getMinimapPosition(currentScene.x, currentScene.y)
    : null;
  const viewDeg =
    state.viewParam?.yaw !== undefined
      ? -trimDeg(radToDeg(state.viewParam.yaw || 0) + 180)
      : 0;

  return (
    <div
      className='absolute'
      style={{
        top: `${scenePosition?.y}%`,
        left: `${scenePosition?.x}%`,
        transform: `scale(${Math.sqrt(1 / props.mapScale)})`,
      }}
    >
      <HereDeg
        style={{
          transform: `rotate(${viewDeg}deg)`,
          backgroundImage: `url("${currentareaSvg}")`,
        }}
      />
      <HerePoint
        style={{
          backgroundImage: `url("${currentpointSvg}")`,
        }}
      />
    </div>
  );
}

export default Here;
