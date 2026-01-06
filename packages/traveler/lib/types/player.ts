import { Direction } from './direction';

export enum Transition {
  READY = 'ready',
  DOING = 'doing',
  END = 'end',
}

export enum TransitionEffect {
  FADE = 'fade',
  SLIDE_FROM_TOP = 'slideFromTop',
  SLIDE_FROM_BOTTOM = 'slideFromBottom',
  SLIDE_FROM_LEFT = 'slideFromLeft',
  SLIDE_FROM_RIGHT = 'slideFromRight',
}

export interface SceneSwitchParam {
  init: boolean;
  direction: Direction;
}
