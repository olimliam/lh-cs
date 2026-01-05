// Existing exports
export { default as DrawingBoard } from './ui/drawing-board';
export { default as DrawingToolBox } from './ui/drawing-tool-box';

// New drawing mode exports
export { useDrawingModeStore } from './model/drawing-mode.store';
export type {
  DrawingModeState,
  DrawingModeActions,
} from './model/drawing-mode.store';

export { WS_TOPIC } from '@/shared/model/ws-const';
