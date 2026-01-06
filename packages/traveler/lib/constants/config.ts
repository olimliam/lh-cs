/**
 * Traveler 시스템의 설정 상수를 정의합니다.
 */
export type TravelerConfig = {
  readonly MAX_FOV: number;
  readonly MIN_FOV: number;

  readonly DEFAULT_PANORAMA_ALPHA: number;

  readonly PICK_TOLERANCE: number;
  readonly PINCH_TOLERANCE: number;

  readonly DOME_SIZE: number;
  readonly PANORAMA_RESOLUTION: number;

  readonly ANIM_FRAME: number;
  readonly ANIM_SPEED: number;

  readonly MAX_CAMERA_ROT_X: number;
  readonly MIN_CAMERA_ROT_X: number;
  readonly TEST_CAMERA_POS_Y: number;

  readonly TRAVELER_VISITOR_KEY: string;
  readonly TRAVELER_TRAVEL_KEY: string;
  readonly TRAVELER_ACCESS_TOKEN_KEY: string;

  readonly ELYPECS_ACCESS_TOKEN_KEY: string;
  readonly ELYPECS_ACCESS_TOKEN_SECRET_KEY: string;
};

/**
 * Traveler 시스템의 설정 상수 값입니다.
 */
export const CONFIG: TravelerConfig = {
  MAX_FOV: 1.5,
  MIN_FOV: 0.6,

  DEFAULT_PANORAMA_ALPHA: 1,

  PICK_TOLERANCE: 10,
  PINCH_TOLERANCE: 5,

  PANORAMA_RESOLUTION: 64,
  DOME_SIZE: 500,

  ANIM_FRAME: 120,
  ANIM_SPEED: 2,

  MAX_CAMERA_ROT_X: 0.8,
  MIN_CAMERA_ROT_X: -0.8,
  TEST_CAMERA_POS_Y: 0,

  TRAVELER_VISITOR_KEY: 'TVID',
  TRAVELER_TRAVEL_KEY: 'TTID',
  TRAVELER_ACCESS_TOKEN_KEY: 'TATID',

  ELYPECS_ACCESS_TOKEN_KEY: '__auth__',
  ELYPECS_ACCESS_TOKEN_SECRET_KEY: '__zvsc__',
};