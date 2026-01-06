export const DEFAULT_DB_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAACWCAYAAABkW7XSAAAAAXNSR0IArs4c6QAABGJJREFUeF7t1AEJAAAMAsHZv/RyPNwSyDncOQIECEQEFskpJgECBM5geQICBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAAYPlBwgQyAgYrExVghIgYLD8AAECGQGDlalKUAIEDJYfIEAgI2CwMlUJSoCAwfIDBAhkBAxWpipBCRAwWH6AAIGMgMHKVCUoAQIGyw8QIJARMFiZqgQlQMBg+QECBDICBitTlaAECBgsP0CAQEbAYGWqEpQAgQdWMQCX4yW9owAAAABJRU5ErkJggg==';

export const TOOL_BOX_TYPE = {
  UNDO: 'undo',
  REDO: 'redo',
  TRASH: 'trash',
  ERASER: 'eraser',
  BRUSH: 'brush',
  DASH: 'dash',
  LINE: 'line',
  COLOR: 'color',
  STROKE: 'stroke',
} as const;
export type ToolBoxType = (typeof TOOL_BOX_TYPE)[keyof typeof TOOL_BOX_TYPE];

export const COLOR_CHIP = {
  WHITE: '#fff',
  BLACK: '#000',
  BLUE: '#3B7CF3',
  GREEN: '#79D475',
  YELLOW: '#F7D254',
  RED: '#E8464A',
} as const;

export type ColorChipType = (typeof COLOR_CHIP)[keyof typeof COLOR_CHIP];

// PEN_COLOR object and type
export const PEN_COLOR = {
  WHITE: 'white',
  BLACK: 'black',
  BLUE: 'blue',
  GREEN: 'green',
  RED: 'red',
  YELLOW: 'yellow',
} as const;

export type PenColorType = (typeof PEN_COLOR)[keyof typeof PEN_COLOR];

// PEN_WIDTH object and type
export const PEN_WIDTH = {
  LIGHT: 1,
  NORMAL: 2,
  BOLD: 4,
} as const;

export type PenWidthType = (typeof PEN_WIDTH)[keyof typeof PEN_WIDTH];

export const PEN_TYPE = {
  DASHED: 'dashed',
  SOLID: 'solid',
  LINE: 'line',
} as const;

export type PenType = (typeof PEN_TYPE)[keyof typeof PEN_TYPE];

export const DELETE_MODE = {
  TRASH: 'trash',
  ERASER: 'eraser',
  NONE: 'none',
} as const;

export type DeleteModeType = (typeof DELETE_MODE)[keyof typeof DELETE_MODE];

export const UN_RE_DO_MODE = {
  UNDO: 'undo',
  REDO: 'redo',
  NONE: 'none',
} as const;

export type UnRedoModeType = (typeof UN_RE_DO_MODE)[keyof typeof UN_RE_DO_MODE];

// export const DRAW_TYPE = {
//   START: 'start',
//   DRAW: 'draw',
//   STOP: 'stop',
//   CLEAR: 'clear',
// } as const;

// export type DrawType = (typeof DRAW_TYPE)[keyof typeof DRAW_TYPE];

export const PUBLISH_TYPE = {
  UNDO: 'undo',
  REDO: 'redo',
  CLEAR: 'clear',
  STACK: 'stack',
};

export type PublishType = (typeof PUBLISH_TYPE)[keyof typeof PUBLISH_TYPE];
