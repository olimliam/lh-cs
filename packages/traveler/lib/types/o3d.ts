import * as BABYLON from '@babylonjs/core';
import { TourDisplayResourceIcon } from './tour';

// 3D모델 정보
export interface O3DModelData {
  url: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  scale: number;
}

export interface O3DPosition {
  x: number;
  y: number;
  z: number;
}

export enum O3DMarkerType {
  viewerImage = 'viewerImage',
  viewerVideo = 'viewerVideo',
  viewerVideoLink = 'viewerVideoLink',
  viewerHtml = 'viewerHtml',
  item = 'item',
  invisible = 'invisible',
  text = 'text',
  items = 'items',
  ad = 'ad',
  mesh = 'mesh',
}

export interface O3DMarkerMeta {
  url?: string;
  muted?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  pluginPivot?: boolean;
  borderColor?: string;
  borderEffect?: string;
  value?: string;
  glowEffect?: boolean;
  glowColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontColor?: string;
  fontSize?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineSpace?: number;
  htmlType?: 'url' | 'html';
  htmlContent?: string;
  scrollable?: boolean;
  viewOnly?: boolean;
  icons?: Array<TourDisplayResourceIcon>;
  hasChromaKey?: boolean;
  chromaKey?: string;
  animationType?: AnimationTypeKeys;
}

export interface IO3DMarker {
  id: number | string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  roll: number;
  width: number;
  height: number;
  depth: number;
  billboard: boolean;
  title: string;
  isIndicator: boolean;
  upperTitle?: string;
  showTitle: boolean;
  type: O3DMarkerType;
  override?: O3DPosition;
  meta?: O3DMarkerMeta;
}

export type AnimationType = Record<
  'bounce' | 'pulse' | 'flash',
  {
    frameRate: number;
    endFrame: number;
    isLoop?: boolean;
    animations: Array<{
      name: string;
      /**
       * scaling, rotation, position, visibility etc...
       */
      property: string;
      dataType:
        | typeof BABYLON.Animation.ANIMATIONTYPE_COLOR3
        | typeof BABYLON.Animation.ANIMATIONTYPE_FLOAT
        | typeof BABYLON.Animation.ANIMATIONTYPE_MATRIX
        | typeof BABYLON.Animation.ANIMATIONTYPE_QUATERNION
        | typeof BABYLON.Animation.ANIMATIONTYPE_VECTOR2
        | typeof BABYLON.Animation.ANIMATIONTYPE_VECTOR3;
      loopMode:
        | typeof BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        | typeof BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        | typeof BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE
        | typeof BABYLON.Animation.ANIMATIONLOOPMODE_YOYO;
      animationKeys: Array<BABYLON.IAnimationKey>;
    }>;
  }
> &
  Record<'' | 'none', undefined>;

export type AnimationTypeKeys = keyof AnimationType;
