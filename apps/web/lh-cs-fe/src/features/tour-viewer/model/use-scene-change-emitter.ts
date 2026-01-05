import { useEffect } from 'react';

export const useSceneChangeEmitter = (
  currentSceneId: number | undefined,
  onSceneChange?: (sceneId: number) => void
) => {
  useEffect(() => {
    if (currentSceneId === undefined || !onSceneChange) return;
    onSceneChange(currentSceneId);
  }, [currentSceneId, onSceneChange]);
};

