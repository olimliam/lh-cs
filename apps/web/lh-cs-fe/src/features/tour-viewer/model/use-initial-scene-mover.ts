import { Dispatch, SetStateAction, useEffect } from 'react';

const INITIAL_SCENE_DELAY_MS = 500;

interface UseInitialSceneMoverParams {
  isTourLoaded: boolean;
  startSceneId?: number;
  fallbackSceneId?: number;
  moveToTargetSpot: (sceneId: number) => void;
  setCurrentSceneId: Dispatch<SetStateAction<number | undefined>>;
}

export const useInitialSceneMover = ({
  isTourLoaded,
  startSceneId,
  fallbackSceneId,
  moveToTargetSpot,
  setCurrentSceneId,
}: UseInitialSceneMoverParams) => {
  useEffect(() => {
    if (!isTourLoaded) return;
    const targetSceneId = startSceneId ?? fallbackSceneId;
    if (!targetSceneId) return;

    const delay = startSceneId !== undefined ? 0 : INITIAL_SCENE_DELAY_MS;
    const timer = setTimeout(() => {
      moveToTargetSpot(Number(targetSceneId));
      setCurrentSceneId(Number(targetSceneId));
    }, delay);

    return () => clearTimeout(timer);
  }, [
    fallbackSceneId,
    isTourLoaded,
    moveToTargetSpot,
    setCurrentSceneId,
    startSceneId,
  ]);
};

