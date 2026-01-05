import { create } from 'zustand';

export interface DrawingModeState {
  isDrawingMode: boolean;
  isToolboxVisible: boolean;
}

export interface DrawingModeActions {
  toggleDrawingMode: () => void;
  setDrawingMode: (enabled: boolean) => void;
  toggleToolboxVisibility: () => void;
  setToolboxVisibility: (visible: boolean) => void;
}

interface DrawingModeStore extends DrawingModeState, DrawingModeActions {}

export const useDrawingModeStore = create<DrawingModeStore>((set, get) => ({
  // State
  isDrawingMode: false,
  isToolboxVisible: false,

  // Actions
  toggleDrawingMode: () => {
    const currentMode = get().isDrawingMode;
    set({
      isDrawingMode: !currentMode,
      isToolboxVisible: !currentMode, // 그리기 모드와 함께 툴박스 표시/숨김
    });
  },

  setDrawingMode: (enabled: boolean) => {
    set({
      isDrawingMode: enabled,
      isToolboxVisible: enabled,
    });
  },

  toggleToolboxVisibility: () => {
    set((state) => ({
      isToolboxVisible: !state.isToolboxVisible,
    }));
  },

  setToolboxVisibility: (visible: boolean) => {
    set({
      isToolboxVisible: visible,
    });
  },
}));