import React, { createContext, useContext, useCallback, useState } from 'react';
import { ToastData, ToastType } from '@/shared/types/toast.types';
import { BangIcon, CheckIcon, XIcon } from '../ui';

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
  toasts: ToastData[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const getToastConfig = (type: ToastType) => {
    switch (type) {
      case 'info':
        return {
          color: '#0055A2',
          icon: <BangIcon />,
        };
      case 'success':
        return {
          color: '#90C31F',
          icon: <CheckIcon />,
        };
      case 'error':
        return {
          color: '#FF5861',
          icon: <XIcon />,
        };
    }
  };

  const showToast = useCallback((message: string, type: ToastType) => {
    const config = getToastConfig(type);
    const id = `toast-${Date.now()}-${Math.random()}`;

    const newToast: ToastData = {
      id,
      value: message,
      type,
      ...config,
    };

    setToasts((prev) => [...prev, newToast]);
    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
};
