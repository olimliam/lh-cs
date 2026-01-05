import { create } from 'zustand';
import {
  ViewportData,
  ViewportSyncState,
  ViewportSyncActions,
} from './viewport-sync.types';

interface ViewportSyncStore extends ViewportSyncState, ViewportSyncActions {}

export const useViewportSyncStore = create<ViewportSyncStore>((set) => ({
  // State
  currentViewport: null,
  isUserConnected: false,
  adminSyncEnabled: true,
  lastSyncTime: 0,

  // Actions
  updateViewport: (viewport: ViewportData) => {
    set({
      currentViewport: viewport,
      lastSyncTime: Date.now(),
    });
  },

  setUserConnected: (connected: boolean) => {
    set({
      isUserConnected: connected,
    });
  },

  toggleAdminSync: () => {
    set((state) => ({
      adminSyncEnabled: !state.adminSyncEnabled,
    }));
  },

  setAdminSync: (enabled: boolean) => {
    set({
      adminSyncEnabled: enabled,
    });
  },

  clearViewport: () => {
    set({
      currentViewport: null,
      isUserConnected: false,
      lastSyncTime: 0,
    });
  },
}));
