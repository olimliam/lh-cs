import { useMemo, useState } from 'react';

import { sortBy } from 'lodash';
import { Direction } from '../types/direction';
import { useViewer } from '../contexts/ViewerContext';

export function usePrimeSceneSearch() {
  const [searchWord, setSearchWord] = useState<string>('');

  const { state, getTour, setCurrentScene } = useViewer();

  const currentTierScenes = getTour().scenes;

  const isFilled = (() => {
    if (searchWord && searchWord.length > 0) {
      return true;
    } else {
      return false;
    }
  })();

  const primeScenes = useMemo(() => {
    const scenes = currentTierScenes.filter((x) => x.importantPlace);

    const result = (() => {
      if (!searchWord || searchWord.length === 0) {
        return scenes;
      } else {
        return scenes.filter((x) => {
          const title = x.title.toLowerCase();
          const key = searchWord.toLowerCase();
          return title.indexOf(key) > -1;
        });
      }
    })();

    return sortBy(result, 'title').map((x) => {
      const scene = currentTierScenes.find((y) => y.id === x.id);
      const layer = scene?.layers.find(
        (y) => y.themeID === state.currentThemeID
      );

      const img = (() => {
        if (layer?.convertedImg) {
          return `${layer?.convertedImg}/preview.jpg`;
        } else {
          return null;
        }
      })();

      return Object.assign({}, x, {
        thumb: img,
      });
    });
  }, [searchWord, currentTierScenes, state.currentThemeID]);

  const handleSceneClick = (sceneID: number) => {
    setCurrentScene(sceneID, {
      init: true,
      direction: Direction.UNAVAILABLE,
    });
  };

  return {
    isFilled,
    searchWord,
    setSearchWord,
    primeScenes,
    handleSceneClick,
  };
}
