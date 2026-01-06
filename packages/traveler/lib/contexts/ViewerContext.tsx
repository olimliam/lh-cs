import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { sortBy } from 'lodash';

import { Direction } from '../types/direction';
import {
  SceneSwitchParam,
  Transition,
  TransitionEffect,
} from '../types/player';
import {
  TourDisplayResourceIconType,
  TourGeometry,
  TourGeometryUseType,
  TourKeymap,
  TourLayer,
  TourMarker,
  TourMarkerType,
  TourScene,
  TourTheme,
  TourViewParam,
} from '../types/tour';
import { TravelerMarkerContent, TravelerTour } from '../types/traveler-tour';
import getTraveler from '../core/traveler';
import { MoveToTargetSpotOptions } from '../types/traveler';

interface MarkerContent {
  markerId: number | string | null;
  type: TourMarkerType | null;
  option: TravelerMarkerContent | null;
}

interface ViewSwitchParam {
  yaw: number | null;
  pitch: number | null;
  fov: number | null;
}

interface ViewerState {
  loaded: boolean;
  initialized: boolean;
  isFirstInteract: boolean;
  isFirstCompareInteract: boolean;
  isAutoRotate: boolean;
  isComparison: boolean;
  isVrPlayer: boolean;
  isFirstVrPlayerInteract: boolean;
  currentSceneID: number;
  currentThemeID: number;
  currentCompareThemeID: number;
  latestMarkerID: number | null;
  currentMarkerID: number | null;
  sceneSwitching: Transition;
  geometrySwitching: Transition;
  transitionEffect: TransitionEffect;
  tour: TravelerTour;
  sceneSwitchParam: SceneSwitchParam;
  viewSwitchParam: ViewSwitchParam;
  viewParam: {
    yaw: number;
    pitch: number;
    roll: number;
    fov: number;
  };
  viewVrParam: {
    yaw: number | null;
    pitch: number | null;
  };
  markerContent: MarkerContent;
  currentModelSize: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    centerZ: number;
  };
  currentTTSParam: {
    id: number | string | null;
    activeType: TourDisplayResourceIconType;
  };
  visibleScenes: Array<TourScene>;
}

type PlayerAction =
  | {
      type: 'INIT_PLAYER';
      payload: {
        tour: TravelerTour;
        startSceneID?: number;
        startThemeID?: number;
      };
    }
  | { type: 'SET_LOADED'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_IS_FIRST_INTERACT'; payload: boolean }
  | { type: 'SET_IS_FIRST_COMPARE_INTERACT'; payload: boolean }
  | { type: 'SET_IS_AUTO_ROTATE'; payload: boolean }
  | { type: 'SET_IS_COMPARISON'; payload: boolean }
  | { type: 'SET_IS_VR_PLAYER'; payload: boolean }
  | { type: 'SET_IS_FIRST_VR_PLAYER_INTERACT'; payload: boolean }
  | { type: 'SET_CURRENT_SCENE_ID'; payload: number }
  | { type: 'SET_CURRENT_THEME_ID'; payload: number }
  | { type: 'SET_CURRENT_COMPARE_THEME_ID'; payload: number }
  | { type: 'SET_LATEST_MARKER_ID'; payload: number | null }
  | { type: 'SET_CURRENT_MARKER_ID'; payload: number | null }
  | {
      type: 'SET_VIEW_SWITCH_PARAM';
      payload: ViewSwitchParam;
    }
  | { type: 'SET_CURRENT_THEME'; payload: number }
  | {
      type: 'SET_CURRENT_MODEL_SIZE';
      payload: {
        width: number;
        height: number;
        centerX: number;
        centerY: number;
        centerZ: number;
      };
    }
  | { type: 'SET_GEOMETRY_SWITCHING'; payload: Transition }
  | { type: 'SET_VIEW_PARAM'; payload: TourViewParam }
  | {
      type: 'SET_CURRENT_SCENE';
      payload: {
        sceneID: number;
        sceneSwitchParam: SceneSwitchParam;
        transitionEffect?: TransitionEffect;
      };
    }
  | {
      type: 'SET_MARKER_CONTENT';
      payload: {
        markerId: number | string | null;
        type: TourMarkerType | null;
        option: TravelerMarkerContent | null;
      };
    };

const initialState: ViewerState = {
  loaded: false,
  initialized: false,
  isFirstInteract: false,
  isFirstCompareInteract: false,
  isAutoRotate: false,
  isComparison: false,
  isVrPlayer: false,
  isFirstVrPlayerInteract: false,
  currentSceneID: 0,
  currentThemeID: 0,
  currentCompareThemeID: 0,
  latestMarkerID: null,
  currentMarkerID: null,
  sceneSwitching: Transition.READY,
  geometrySwitching: Transition.READY,
  transitionEffect: TransitionEffect.FADE,
  tour: {
    scenes: [] as Array<TourScene>,
    themes: [] as Array<TourTheme>,
    markers: [] as Array<TourMarker>,
    minimaps: [] as Array<TourKeymap>,
    geometries: [] as Array<TourGeometry>,
  } as unknown as TravelerTour,
  sceneSwitchParam: {
    init: true,
    direction: Direction.UNAVAILABLE,
  },
  viewSwitchParam: {
    yaw: null,
    pitch: null,
    fov: null,
  },
  viewParam: {
    yaw: 0,
    pitch: 0,
    roll: 0,
    fov: 0,
  },
  viewVrParam: {
    yaw: null,
    pitch: null,
  },
  markerContent: {
    markerId: null,
    type: null,
    option: null,
  },
  currentModelSize: {
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    centerZ: 0,
  },
  currentTTSParam: {
    id: null,
    activeType: TourDisplayResourceIconType.off,
  },
  visibleScenes: [],
};

// reducer 함수 정의
function viewerReducer(state: ViewerState, action: PlayerAction): ViewerState {
  switch (action.type) {
    case 'INIT_PLAYER': {
      console.log('INIT_PLAYER', action.payload);
      console.log('INIT_PLAYER tour.markers:', action.payload.tour.markers);
      const { tour, startSceneID, startThemeID } = action.payload;
      const currentSceneID =
        startSceneID || tour.startingSceneID || tour.scenes[0].id;
      const currentScene = tour.scenes.find((x) => x.id == currentSceneID);

      return {
        ...state,
        tour: tour,
        currentSceneID: currentSceneID,
        currentThemeID: startThemeID || sortBy(tour.themes, 'order')[0].id,
        viewParam: {
          yaw: currentScene?.yaw || 0,
          pitch: currentScene?.pitch || 0,
          roll: currentScene?.roll || 0,
          fov: tour.fov,
        },
        loaded: true,
      };
    }
    case 'SET_LOADED':
      return { ...state, loaded: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, initialized: action.payload };
    case 'SET_IS_FIRST_INTERACT':
      return { ...state, isFirstInteract: action.payload };
    case 'SET_IS_FIRST_COMPARE_INTERACT':
      return { ...state, isFirstCompareInteract: action.payload };
    case 'SET_IS_AUTO_ROTATE':
      return { ...state, isAutoRotate: action.payload };
    case 'SET_IS_COMPARISON':
      return { ...state, isComparison: action.payload };
    case 'SET_IS_VR_PLAYER':
      return { ...state, isVrPlayer: action.payload };
    case 'SET_IS_FIRST_VR_PLAYER_INTERACT':
      return { ...state, isFirstVrPlayerInteract: action.payload };
    case 'SET_CURRENT_SCENE_ID':
      return { ...state, currentSceneID: action.payload };
    case 'SET_CURRENT_THEME_ID':
      return { ...state, currentThemeID: action.payload };
    case 'SET_CURRENT_COMPARE_THEME_ID':
      return { ...state, currentCompareThemeID: action.payload };
    case 'SET_LATEST_MARKER_ID':
      return { ...state, latestMarkerID: action.payload };
    case 'SET_CURRENT_MARKER_ID':
      return { ...state, currentMarkerID: action.payload };
    case 'SET_MARKER_CONTENT':
      return { ...state, markerContent: action.payload };
    case 'SET_VIEW_SWITCH_PARAM':
      return { ...state, viewSwitchParam: action.payload };
    case 'SET_CURRENT_THEME':
      return {
        ...state,
        currentThemeID: action.payload,
        sceneSwitchParam: {
          init: false,
          direction: Direction.UNAVAILABLE,
        },
      };
    case 'SET_CURRENT_MODEL_SIZE':
      return { ...state, currentModelSize: action.payload };
    case 'SET_GEOMETRY_SWITCHING':
      return { ...state, geometrySwitching: action.payload };
    case 'SET_VIEW_PARAM':
      return {
        ...state,
        viewParam: {
          yaw: action.payload.yaw ?? state.viewParam.yaw,
          pitch: action.payload.pitch ?? state.viewParam.pitch,
          roll: action.payload.roll ?? state.viewParam.roll,
          fov: action.payload.fov ?? state.viewParam.fov,
        },
      };
    case 'SET_CURRENT_SCENE':
      return {
        ...state,
        currentSceneID: action.payload.sceneID,
        sceneSwitchParam: action.payload.sceneSwitchParam,
        transitionEffect:
          action.payload.transitionEffect || TransitionEffect.FADE,
      };
    default:
      return state;
  }
}

interface ViewerContextType {
  state: ViewerState;
  initPlayer: (
    tour: TravelerTour,
    startSceneID?: number,
    startThemeID?: number
  ) => void;
  getTour: () => TravelerTour;
  getCurrentScene: () => TourScene;
  getSortedThemes: () => TourTheme[];
  getThemeGeometries: () => TourGeometry[];
  getMarkerGeometries: () => TourGeometry[];
  getCurrentTheme: () => TourTheme | null;
  getCurrentGeometry: () => TourGeometry | null;
  getCurrentMinimap: () => TourKeymap | null;
  getCurrentLayer: () => TourLayer | null;
  getMarkerContent: () => MarkerContent;
  getCurrentCompareLayer: () => TourLayer;
  getLoaded: () => boolean;
  getInitialized: () => boolean;
  setLoaded: (value: boolean) => void;
  setInitialized: (value: boolean) => void;
  setIsFirstInteract: (value: boolean) => void;
  setIsFirstCompareInteract: (value: boolean) => void;
  setIsAutoRotate: (value: boolean) => void;
  setIsComparison: (value: boolean) => void;
  setIsVrPlayer: (value: boolean) => void;
  setIsFirstVrPlayerInteract: (value: boolean) => void;
  setCurrentSceneID: (value: number) => void;
  setCurrentThemeID: (value: number) => void;
  setCurrentCompareThemeID: (value: number) => void;
  setLatestMarkerID: (value: number | null) => void;
  setCurrentMarkerID: (value: number | null) => void;
  setCurrentTheme: (currentThemeID: number) => void;
  setOnMarkerClick: (
    callback: (
      markerId: number,
      markerName?: string,
      markerDescription?: string,
      contentType?: TourMarkerType,
      contentData?: TravelerMarkerContent
    ) => void
  ) => void;

  setMarkerContent: (content: MarkerContent) => void;
  setOnSceneClick: (
    callback: (id: number, title?: string, description?: string) => void
  ) => void;
  setOnRotationChange: (
    callback: (
      pitch: number,
      yaw: number,
      roll: number,
      sceneId?: number
    ) => void
  ) => void;
  setOnFovChange: (callback: (fov: number) => void) => void;
  setCameraRotation: (pitch: number, yaw: number, roll: number) => void;
  setCameraFov: (fov: number) => void;
  setCameraControlEnabled: (enabled: boolean) => void;
  getCameraControlEnabled: () => boolean;
  setCurrentModelSize: (modelSize: {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    centerZ: number;
  }) => void;
  setViewSwitchParam: (viewSwitchParam: {
    yaw: number | null;
    pitch: number | null;
    fov: number | null;
  }) => void;
  setCurrentScene: (
    sceneID: number,
    sceneSwitchParam: { init: boolean; direction: Direction },
    transitionEffect?: TransitionEffect
  ) => void;
  setGeometrySwitching: (transition: Transition) => void;
  setViewParam: (viewParam: TourViewParam) => void;
  moveToTargetSpot: (
    targetSpotId: number,
    options?: MoveToTargetSpotOptions
  ) => void;
  hideMarker: (markerId: number, allPlace?: boolean) => void;
  revealMarker: (markerId: number, allPlace?: boolean) => void;
  getIsPopupOpen: () => boolean;
  handleTogglePopup: (value: boolean) => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

interface ViewerProviderProps {
  children: ReactNode;
}

export const ViewerProvider: React.FC<ViewerProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(viewerReducer, initialState);

  // Context 값으로 제공할 메서드들 정의
  const initPlayer = useCallback(
    (tour: TravelerTour, startSceneID?: number, startThemeID?: number) => {
      dispatch({
        type: 'INIT_PLAYER',
        payload: { tour, startSceneID, startThemeID },
      });
    },
    []
  );

  const setLoaded = useCallback((value: boolean) => {
    dispatch({ type: 'SET_LOADED', payload: value });
  }, []);

  const setInitialized = useCallback((value: boolean) => {
    dispatch({ type: 'SET_INITIALIZED', payload: value });
  }, []);

  const setIsFirstInteract = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_FIRST_INTERACT', payload: value });
  }, []);

  const setIsFirstCompareInteract = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_FIRST_COMPARE_INTERACT', payload: value });
  }, []);

  const setIsAutoRotate = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_AUTO_ROTATE', payload: value });
  }, []);

  const setIsComparison = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_COMPARISON', payload: value });
  }, []);

  const setIsVrPlayer = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_VR_PLAYER', payload: value });
  }, []);

  const setIsFirstVrPlayerInteract = useCallback((value: boolean) => {
    dispatch({ type: 'SET_IS_FIRST_VR_PLAYER_INTERACT', payload: value });
  }, []);

  const setCurrentSceneID = useCallback((value: number) => {
    dispatch({ type: 'SET_CURRENT_SCENE_ID', payload: value });
    console.debug('value : ', value);
  }, []);

  const setCurrentThemeID = useCallback((value: number) => {
    dispatch({ type: 'SET_CURRENT_THEME_ID', payload: value });
  }, []);

  const setCurrentCompareThemeID = useCallback((value: number) => {
    dispatch({ type: 'SET_CURRENT_COMPARE_THEME_ID', payload: value });
  }, []);

  const setLatestMarkerID = useCallback((value: number | null) => {
    dispatch({ type: 'SET_LATEST_MARKER_ID', payload: value });
  }, []);

  const setCurrentMarkerID = useCallback((value: number | null) => {
    dispatch({ type: 'SET_CURRENT_MARKER_ID', payload: value });
  }, []);

  const setViewSwitchParam = useCallback(
    (viewSwitchParam: {
      yaw: number | null;
      pitch: number | null;
      fov: number | null;
    }) => {
      dispatch({ type: 'SET_VIEW_SWITCH_PARAM', payload: viewSwitchParam });
    },
    []
  );

  const setMarkerContent = useCallback(
    (content: {
      markerId: number | string | null;
      type: TourMarkerType | null;
      option: TravelerMarkerContent | null;
    }) => {
      dispatch({ type: 'SET_MARKER_CONTENT', payload: content });
    },
    []
  );

  const setCurrentTheme = useCallback((currentThemeID: number) => {
    dispatch({ type: 'SET_CURRENT_THEME', payload: currentThemeID });
  }, []);

  const setCurrentModelSize = useCallback(
    (modelSize: {
      width: number;
      height: number;
      centerX: number;
      centerY: number;
      centerZ: number;
    }) => {
      dispatch({ type: 'SET_CURRENT_MODEL_SIZE', payload: modelSize });
    },
    []
  );

  const setGeometrySwitching = useCallback((transition: Transition) => {
    dispatch({ type: 'SET_GEOMETRY_SWITCHING', payload: transition });
  }, []);

  const setViewParam = useCallback((viewParam: TourViewParam) => {
    dispatch({ type: 'SET_VIEW_PARAM', payload: viewParam });
  }, []);

  const setCurrentScene = useCallback(
    (
      sceneID: number,
      sceneSwitchParam: { init: boolean; direction: Direction },
      transitionEffect?: TransitionEffect
    ) => {
      dispatch({
        type: 'SET_CURRENT_SCENE',
        payload: { sceneID, sceneSwitchParam, transitionEffect },
      });
    },
    []
  );

  // 기존 get 함수들 구현
  const getTour = useCallback(() => state.tour, [state.tour]);

  const getCurrentScene = useCallback(() => {
    const scene = state.tour.scenes.find(
      (scene: TourScene) => scene.id === state.currentSceneID
    );
    return scene || state.tour.scenes[0];
  }, [state.tour.scenes, state.currentSceneID]);

  const getSortedThemes = useCallback(() => {
    return sortBy(state.tour.themes, 'order');
  }, [state.tour.themes]);

  const getThemeGeometries = useCallback(() => {
    return state.tour.geometries?.filter(
      (geometry: TourGeometry) =>
        geometry.useType === TourGeometryUseType.theme ||
        geometry.useType === TourGeometryUseType.themeDefault
    );
  }, [state.tour.geometries]);

  const getMarkerGeometries = useCallback(() => {
    return state.tour.geometries?.filter(
      (geometry: TourGeometry) =>
        geometry.useType === TourGeometryUseType.marker
    );
  }, [state.tour.geometries]);

  const getCurrentTheme = useCallback(() => {
    const theme = state.tour.themes.find(
      (theme: TourTheme) => theme.id === state.currentThemeID
    );
    if (!theme) {
      console.debug('Cannot find theme');
      return null;
    }
    return theme;
  }, [state.tour.themes, state.currentThemeID]);

  const getCurrentGeometry = useCallback(() => {
    const geometries = getThemeGeometries();
    const currentTheme = getCurrentTheme();
    if (!currentTheme) return null;

    const geometry = geometries.find(
      (geometry: TourGeometry) => geometry.id === currentTheme.geometryID
    );
    if (!geometry) {
      console.debug('Cannot find geometry');
      return null;
    }
    return geometry;
  }, [getThemeGeometries, getCurrentTheme]);

  const getCurrentMinimap = useCallback(() => {
    const currentTheme = getCurrentTheme();
    if (!currentTheme) return null;

    const minimapID = currentTheme.minimapID;
    const minimap =
      state.tour.minimaps.find(
        (minimap: TourKeymap) => minimap.id === minimapID
      ) || state.tour.minimaps[0];
    if (!minimap) {
      return null;
    }
    return minimap;
  }, [state.tour.minimaps, getCurrentTheme]);

  const getCurrentLayer = useCallback(() => {
    const currentScene = getCurrentScene();
    const layers = currentScene.layers;
    const layer =
      layers.find((x: TourLayer) => x.themeID === state.currentThemeID) ||
      layers[0];
    if (!layer) {
      console.debug('Cannot find layer');
      return null;
    }
    return layer;
  }, [getCurrentScene, state.currentThemeID]);

  const getMarkerContent = useCallback(
    () => state.markerContent,
    [state.markerContent]
  );

  const getCurrentCompareLayer = useCallback(() => {
    const currentScene = getCurrentScene();
    const layers = currentScene.layers;
    const layer =
      layers.find(
        (x: TourLayer) => x.themeID === state.currentCompareThemeID
      ) || layers[0];
    if (!layer) {
      throw new Error('Cannot find layer');
    }
    return layer;
  }, [getCurrentScene, state.currentCompareThemeID]);

  const getLoaded = useCallback(() => state.loaded, [state.loaded]);
  const getInitialized = useCallback(
    () => state.initialized,
    [state.initialized]
  );

  const moveToTargetSpot = useCallback(
    (targetSpotId: number, options?: MoveToTargetSpotOptions) => {
      const traveler = getTraveler();
      traveler.moveToTargetSpot(targetSpotId, options);
    },
    []
  );
  const hideMarker = useCallback((markerId: number, allPlace?: boolean) => {
    const traveler = getTraveler();
    traveler.hideMarker(markerId, allPlace);
  }, []);

  const revealMarker = useCallback((markerId: number, allPlace?: boolean) => {
    const traveler = getTraveler();
    traveler.revealMarker(markerId, allPlace);
  }, []);
  const setOnMarkerClick = useCallback(
    (
      callback: (
        markerId: number,
        markerName?: string,
        markerDescription?: string,
        contentType?: TourMarkerType,
        contentData?: TravelerMarkerContent
      ) => void
    ) => {
      const traveler = getTraveler();
      traveler.setOnMarkerClick(callback);
    },
    []
  );
  const setOnSceneClick = useCallback(
    (callback: (id: number, title?: string, description?: string) => void) => {
      const traveler = getTraveler();
      traveler.setOnSceneClick(callback);
    },
    []
  );

  const setOnRotationChange = useCallback(
    (
      callback: (
        pitch: number,
        yaw: number,
        roll: number,
        sceneId?: number
      ) => void
    ) => {
      const traveler = getTraveler();
      traveler.setOnRotationChange(callback);
    },
    []
  );

  const setOnFovChange = useCallback((callback: (fov: number) => void) => {
    const traveler = getTraveler();
    traveler.setOnFovChange(callback);
  }, []);

  const setCameraRotation = useCallback(
    (pitch: number, yaw: number, roll: number) => {
      const traveler = getTraveler();
      traveler.setCameraRotation(pitch, yaw, roll);
    },
    []
  );

  const setCameraFov = useCallback((fov: number) => {
    const traveler = getTraveler();
    traveler.setCameraFov(fov);
  }, []);

  const setCameraControlEnabled = useCallback((enabled: boolean) => {
    const traveler = getTraveler();
    traveler.setCameraControlEnabled(enabled);
  }, []);

  const getCameraControlEnabled = useCallback(() => {
    const traveler = getTraveler();
    return traveler.getCameraControlEnabled();
  }, []);

  const getIsPopupOpen = useCallback(() => {
    const traveler = getTraveler();
    return traveler.getIsPopupOpen();
  }, []);
  const handleTogglePopup = useCallback((value: boolean) => {
    const traveler = getTraveler();
    traveler.handleTogglePopup(value);
  }, []);

  const contextValue = {
    state,
    initPlayer,
    getTour,
    getCurrentScene,
    getSortedThemes,
    getThemeGeometries,
    getMarkerGeometries,
    getCurrentTheme,
    getCurrentGeometry,
    getCurrentMinimap,
    getCurrentLayer,
    getCurrentCompareLayer,
    getLoaded,
    getInitialized,
    setLoaded,
    setInitialized,
    setIsFirstInteract,
    setIsFirstCompareInteract,
    setIsAutoRotate,
    setIsComparison,
    setIsVrPlayer,
    setIsFirstVrPlayerInteract,
    setCurrentSceneID,
    setCurrentThemeID,
    setCurrentCompareThemeID,
    setLatestMarkerID,
    setCurrentMarkerID,
    setCurrentTheme,
    setCurrentModelSize,
    setViewSwitchParam,
    setCurrentScene,
    setGeometrySwitching,
    setViewParam,
    setOnMarkerClick,
    setMarkerContent,
    setOnSceneClick,
    setOnRotationChange,
    setOnFovChange,
    setCameraRotation,
    setCameraFov,
    setCameraControlEnabled,
    getCameraControlEnabled,
    moveToTargetSpot,
    hideMarker,
    revealMarker,
    getMarkerContent,
    getIsPopupOpen,
    handleTogglePopup,
  };

  return (
    <ViewerContext.Provider value={contextValue}>
      {children}
    </ViewerContext.Provider>
  );
};

export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error('useViewer must be used within a ViewerProvider');
  }
  return context;
}
