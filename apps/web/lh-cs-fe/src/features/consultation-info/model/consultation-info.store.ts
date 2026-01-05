import { create } from 'zustand';
import { ConsultationInfo, ConsultationInfoState, ConsultationInfoActions } from './consultation-info.types';

interface ConsultationInfoStore extends ConsultationInfoState, ConsultationInfoActions {}

export const useConsultationInfoStore = create<ConsultationInfoStore>((set, get) => ({
  // State
  info: null,
  isVisible: true, // 기본적으로 표시
  isLoading: false,
  error: null,

  // Actions
  setInfo: (info: ConsultationInfo) => {
    set({
      info,
      isLoading: false,
      error: null,
    });
  },

  updateStatus: (status: ConsultationInfo['status']) => {
    const currentInfo = get().info;
    if (currentInfo) {
      set({
        info: {
          ...currentInfo,
          status,
        },
      });
    }
  },

  toggleVisibility: () => {
    set((state) => ({
      isVisible: !state.isVisible,
    }));
  },

  clearInfo: () => {
    set({
      info: null,
      isVisible: true,
      isLoading: false,
      error: null,
    });
  },
}));