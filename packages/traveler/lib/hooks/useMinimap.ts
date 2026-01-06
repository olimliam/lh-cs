import { minBy } from 'lodash';
import { useViewer } from '../contexts/ViewerContext';
import { to2DRatioPosition } from '../utils/viewer.util';
import { makeVector, vectorLength } from '../utils';

export function useMinimap() {
  const { getCurrentMinimap, state } = useViewer();
  const getMinimapPosition = (tourX?: number, tourY?: number) => {
    return (
      to2DRatioPosition({
        sX: tourX || 0,
        sY: tourY || 0,
        minimap: getCurrentMinimap()!,
        modelSize: state.currentModelSize,
      }) || {
        x: -1000000000,
        y: -1000000000,
      }
    );
  };

  const getNearestScene = (
    markerId: number
  ):
    | {
        sceneID: number;
        distance: number;
      }
    | undefined => {
    const scenes = state.tour.scenes;
    const marker = state.tour.markers.find((x) => x.id == markerId);
    if (marker) {
      const result = scenes.map((scene) => {
        return {
          sceneID: scene.id,
          distance: vectorLength(
            makeVector(scene.x, scene.y, scene.z),
            makeVector(marker.x, marker.y, marker.z)
          ),
        };
      });
      return minBy(result, (sceneDistance) => sceneDistance.distance);
    }
  };

  return {
    getMinimapPosition,
    getNearestScene,
  };
}
