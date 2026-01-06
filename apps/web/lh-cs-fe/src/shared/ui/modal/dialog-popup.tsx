import React, { useEffect } from 'react';
import Dialog, { DialogProps } from '@mui/material/Dialog';
import { SxProps, Theme } from '@mui/material/styles';
import clsx from 'clsx';

export type ModalSize = {
  width?: string | number;
  height?: string | number;
};

export interface CustomDialogProps extends Omit<DialogProps, 'open'> {
  isOpen: boolean;
  onClose: () => void;
  modalSize?: ModalSize;
  paperClassName?: string; // Paper에 적용할 커스텀 클래스 (tailwind / css-module 등)
  paperSx?: SxProps<Theme>; // Paper에 적용할 MUI sx (병합 가능)
  containerId?: string; // container가 필요하면 id로 지정
  children?: React.ReactNode;
}

export const DialogPopup = React.forwardRef<HTMLDivElement, CustomDialogProps>(
  function DialogPopup(
    {
      isOpen,
      onClose,
      modalSize = { width: '600px', height: 'auto' },
      paperClassName,
      paperSx,
      containerId = 'root',
      children,
      PaperProps: userPaperProps,
      sx,
      scroll = 'paper',
      ...other
    },
    ref
  ) {
    // 기본 Paper sx (공통)
    const basePaperSx: SxProps<Theme> = {
      margin: 'auto',
      width: '100%',
      maxWidth: modalSize.width,
      minHeight: modalSize.height,
      maxHeight: 'calc(100vh - 32px)',
      borderRadius: '8px',
      boxShadow: 'none',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      padding: '0 16px',
      backgroundColor: 'initial',
    };

    // PaperProps 병합: 사용자 PaperProps와 base를 합침
    const mergedPaperProps = {
      ...userPaperProps,
      className: clsx(userPaperProps?.className, paperClassName),
      sx: Array.isArray(userPaperProps?.sx)
        ? [
            basePaperSx,
            ...(userPaperProps?.sx as any),
            ...(Array.isArray(paperSx) ? paperSx : [paperSx]),
          ]
        : [basePaperSx, (userPaperProps?.sx as any) || {}, paperSx || {}],
    };

    useEffect(() => {
      // 모달이 열렸을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

    return (
      <Dialog
        ref={ref}
        open={isOpen}
        onClose={onClose}
        container={() => document.getElementById(containerId)}
        PaperProps={mergedPaperProps}
        scroll={scroll}
        sx={sx}
        {...other}
      >
        {children}
      </Dialog>
    );
  }
);
