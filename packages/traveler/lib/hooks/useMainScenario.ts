import { useEffect, useState } from 'react';

import { sortBy } from 'lodash';

import { useToolbar } from '../contexts/ToolBarContext';
import { useViewer } from '../contexts/ViewerContext';
import { usePrimeSceneSearch } from './usePrimeScene';

function useMainScenario(startSceneID = 0) {
  const [currentScene, setCurrentScene] = useState<number>(0);

  const { currentTour, isPrimeScene: isImportant } = useToolbar();
  const { state } = useViewer();

  const { handleSceneClick } = usePrimeSceneSearch();

  const PrimeScene = sortBy(
    state.tour.scenes.filter((x) => x.importantPlace),
    'title'
  );

  const startSceneIndex = PrimeScene.findIndex(
    (scene) => scene.id === startSceneID
  );

  const moveScene = (next: number) => {
    const fixNext = (next + PrimeScene.length) % PrimeScene.length;
    setCurrentScene(fixNext);
    handleSceneClick(PrimeScene[fixNext].id);
  };

  useEffect(() => {
    if (startSceneIndex < 0) {
      if (PrimeScene.length > 0 && startSceneID === 0) {
        setCurrentScene(0);
      } else {
        setCurrentScene(-1);
      }
      return;
    }
    // if (PrimeScene.length > 0) {
    //   moveScene(startSceneIndex);
    // }
  }, [currentTour?.tourID, startSceneIndex]);

  return {
    isEmptyScene: PrimeScene.length < 1,
    isVisibleButton: PrimeScene.length > 0 && isImportant,
    onLeftClick: () => moveScene(Math.max(0, currentScene) - 1),
    onRightClick: () => moveScene(currentScene + 1),
  };
}

export default useMainScenario;
