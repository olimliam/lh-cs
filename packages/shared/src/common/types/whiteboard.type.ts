export enum DRAW_TYPE {
  START = 'start',
  DRAW = 'draw',
  STOP = 'stop',
  CLEAR = 'clear',
  UNDO = 'undo',
  REDO = 'redo',
}

export interface Position {
  x: number;
  y: number;
}

export enum PEN_COLOR {
  BLACK = 'black',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  RED = 'red',
  WHITE = 'white',
}
export enum PEN_WIDTH {
  LIGHT = 1,
  NORMAL = 2,
  BOLD = 4,
}

export enum LINE_STYLE {
  DASHED = 'dashed',
  SOLID = 'solid',
  LINE = 'line',
}

export interface CanvasToolOptions {
  penColor: PEN_COLOR;
  penWidth: PEN_WIDTH;
  isEraseMode: boolean;
  lineStyle: LINE_STYLE;
}

export interface Slide {
  id: string;
  drawInfo?: DrawInfo;
  thumbnail?: string;
  image?: string;
  drawStack?: DrawInfo[][];
  redoStack?: DrawInfo[][];
}

export interface DrawInfo {
  type: DRAW_TYPE;
  position?: Position | null;
  options: CanvasToolOptions;
}

export interface PublishMessage {
  type: string;
  data?: DrawInfo[][];
}
