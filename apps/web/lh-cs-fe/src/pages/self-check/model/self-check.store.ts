import { create } from 'zustand';

interface SelfCheckStore {
  tourId: string | undefined;
  facilityId: string | undefined;
  squareMeter: number | undefined;
  setTourId: (tourId: string | undefined) => void;
  setFacilityId: (facilityId: string | undefined) => void;
  setSquareMeter: (squareMeter: number | undefined) => void;
}

export const useSelfCheckStore = create<SelfCheckStore>((set) => ({
  tourId: undefined,
  facilityId: undefined,
  setTourId: (tourId) => set({ tourId }),
  setFacilityId: (facilityId) => set({ facilityId }),

  squareMeter: undefined,
  setSquareMeter: (squareMeter) => set({ squareMeter }),
}));
