import { UserRoleEnum } from '@/shared/model/user-role.enum';
import { create } from 'zustand';

interface TourState {
  // User state
  userMode: UserRoleEnum;

  // Tour state
  currentScene: number;
  totalScenes: number;
  isNavigating: boolean;

  // Control states
  isDrawingMode: boolean | null;
  isSharingMode: boolean | null;
  isSetSharingMode: boolean | null;
  isCameraEditMode: boolean | null;
  isSelfCheckMode: boolean | null;
  connectedUsers: number;
}

interface TourAction {
  // Actions
  setUserMode: (mode: UserRoleEnum) => void;
  setCurrentScene: (scene: number) => void;
  setTotalScenes: (total: number) => void;
  setIsNavigating: (navigating: boolean) => void;
  nextScene: () => void;
  previousScene: () => void;
  goToScene: (scene: number) => void;

  // Mode controls
  toggleDrawingMode: () => void;
  setDrawingMode: (enabled: boolean) => void;
  toggleSharingMode: () => void;
  setSharingMode: (enabled: boolean) => void;
  setIsSetSharingMode: (enabled: boolean) => void;
  toggleCameraEditMode: () => void;
  setCameraEditMode: (enabled: boolean) => void;
  setIsSelfCheckMode: (enabled: boolean) => void;

  // User management
  setConnectedUsers: (count: number) => void;
}

type TourStore = TourState & TourAction;

export const useTourStore = create<TourStore>((set, get) => ({
  // Initial state
  userMode: UserRoleEnum.VISITOR, // 기본값은 VISITOR로 설정
  currentScene: 0,
  totalScenes: 0,
  isNavigating: false,
  isDrawingMode: null,
  isSharingMode: null,
  isSetSharingMode: null,
  isCameraEditMode: null,
  isSelfCheckMode: null,
  connectedUsers: 0,

  // User actions
  setUserMode: (mode) => set({ userMode: mode }),

  // Scene navigation actions
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setTotalScenes: (total) => set({ totalScenes: total }),
  setIsNavigating: (navigating) => set({ isNavigating: navigating }),

  nextScene: () => {
    const { currentScene, totalScenes } = get();
    if (currentScene < totalScenes - 1) {
      set({ currentScene: currentScene + 1 });
    }
  },

  previousScene: () => {
    const { currentScene } = get();
    if (currentScene > 0) {
      set({ currentScene: currentScene - 1 });
    }
  },

  goToScene: (scene) => {
    const { totalScenes } = get();
    if (scene >= 0 && scene < totalScenes) {
      set({ currentScene: scene });
    }
  },

  // Mode controls
  toggleDrawingMode: () =>
    set((state) => ({ isDrawingMode: !state.isDrawingMode })),
  setDrawingMode: (enabled) => set({ isDrawingMode: enabled }),

  toggleSharingMode: () =>
    set((state) => ({ isSharingMode: !state.isSharingMode })),
  setSharingMode: (enabled) => set({ isSharingMode: enabled }),
  setIsSetSharingMode: (enabled) => set({ isSetSharingMode: enabled }),

  toggleCameraEditMode: () =>
    set((state) => ({ isCameraEditMode: !state.isCameraEditMode })),
  setCameraEditMode: (enabled) => set({ isCameraEditMode: enabled }),

  setIsSelfCheckMode: (enabled) => set({ isSelfCheckMode: enabled }),

  // User management
  setConnectedUsers: (count) => set({ connectedUsers: count }),
}));
