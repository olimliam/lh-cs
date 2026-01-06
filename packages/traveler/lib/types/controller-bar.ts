export const MenuTypeConst = {
  MENU: 'menu',
  MINIMAP: 'minimap',
  IMPORTANT: 'important',
  THEME_LIST: 'theme-list',
  THEME_SWITCH: 'theme-switch',
  THEME_COMPARISON: 'theme-comparison',
  ORIGIN: 'origin',
  FULLSCREEN: 'fullscreen',
  SETTING: 'setting',
  LANGUAGE: 'language',
  VR_MODE: 'vr-mode',
} as const;
export type MenuType = (typeof MenuTypeConst)[keyof typeof MenuTypeConst];

export const ControlBarPositionConst = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
} as const;
export type ControlBarPosition =
  (typeof ControlBarPositionConst)[keyof typeof ControlBarPositionConst];

export const ControlBarStyleConst = {
  ROUND_BLACK: 'round-black',
  SQUARE_BLACK: 'square-black',
  CLEAR_WHITE: 'clear-white',
  ROUND_WHITE: 'round-white',
} as const;
export type ControlBarStyle =
  (typeof ControlBarStyleConst)[keyof typeof ControlBarStyleConst];

export const IntroButtonXPositionConst = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
} as const;
export type IntroButtonXPosition =
  (typeof IntroButtonXPositionConst)[keyof typeof IntroButtonXPositionConst];

export const IntroButtonYPositionConst = {
  CENTER: 'center',
  TOP: 'top',
  BOTTOM: 'bottom',
} as const;
export type IntroButtonYPosition =
  (typeof IntroButtonYPositionConst)[keyof typeof IntroButtonYPositionConst];

export interface SpaceControl {
  isActive: boolean;
  position: ControlBarPosition;
  style: ControlBarStyle;
  optionList: Array<{ id: string; isActive: boolean; order: number }>;
}

export interface SpaceIntro {
  btnColor: string;
  btnFont: string;
  btnText: string;
  btnTextColor: string;
  resourceUrl: string;
  canSkip: boolean;
  canToggleSound: boolean;
  isActive: boolean;
  btnPosX: IntroButtonXPosition;
  btnPosY: IntroButtonYPosition;
}

export interface SpaceTour {
  name: string;
  tourId: string;
  order: number;
  sceneId: number;
}

export interface SpaceListRef {
  id: string;
  startingSceneId: number;
  title: string;
  updateAt: string;
}

export interface SpaceInfo {
  spaceId: number;
  logoUrl: string;
  title: string;
  control: SpaceControl;
  intro: SpaceIntro;
  shortcutList: Array<SpaceTour>;
  tourList: Array<SpaceListRef>;
}

export interface ControllerMenuProps {
  isActive?: boolean;
  title: string;
  icon: string;
  type: MenuType;
  onClick: () => void;
}
