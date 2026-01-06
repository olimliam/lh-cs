export type ToastType = 'info' | 'success' | 'error';

export interface ToastData {
  id: string;
  value: string;
  color: string;
  icon: React.ReactNode;
  type: ToastType;
}

export interface ToastState {
  toasts: ToastData[];
  isVisible: boolean;
}