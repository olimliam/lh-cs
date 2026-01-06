import { create } from 'zustand';

interface ModalProps {
  [key: string]: unknown;
}

interface ModalState {
  isOpen: boolean;
  modalType: string | null;
  modalProps?: ModalProps;
  openModal: (type: string, props?: ModalProps) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  modalType: null,
  modalProps: undefined,
  openModal: (type: string, props?: ModalProps) =>
    set({ isOpen: true, modalType: type, modalProps: props }),
  closeModal: () =>
    set({ isOpen: false, modalType: null, modalProps: undefined }),
}));
