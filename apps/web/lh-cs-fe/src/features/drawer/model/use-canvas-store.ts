import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  CanvasToolOptions,
  LINE_STYLE,
  PEN_COLOR,
  PEN_WIDTH,
} from './whiteboard.types';
import { createSetter } from '@/shared/utils/store-util';

interface CanvasState {
  canvasToolOptions: CanvasToolOptions;
}

interface CanvasActions {
  setCanvasToolOptions: (options: CanvasToolOptions) => void;
}

export type CanvasStore = CanvasState & CanvasActions;

const useCanvasStore = create<CanvasStore>()(
  devtools((set) => ({
    canvasToolOptions: {
      penColor: PEN_COLOR.BLACK,
      penWidth: PEN_WIDTH.LIGHT,
      lineStyle: LINE_STYLE.SOLID,
      isEraseMode: false,
      previousLineStyle: LINE_STYLE.SOLID,
    },
    setCanvasToolOptions: createSetter(set, 'canvasToolOptions'),
  }))
);

export default useCanvasStore;
