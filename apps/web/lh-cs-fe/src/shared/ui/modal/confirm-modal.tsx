import React from 'react';
import { BaseModal } from './base-modal';
import { ModalButton } from './modal-button';

interface ConfirmModalProps {
  open: boolean;
  title?: string;
  subTitle?: string;
  noticeTextNode?: React.ReactNode;
  variant?: 'primary' | 'reject';
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  subTitle,
  noticeTextNode,
  variant,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={title || ''}
      message={subTitle || ''}
      noticeTextNode={noticeTextNode}
    >
      <ModalButton onClick={onClose} variant={variant || 'primary'}>
        취소
      </ModalButton>
      <ModalButton
        onClick={handleConfirm}
        variant={variant || 'primary'}
        isFullFilled
      >
        적용
      </ModalButton>
    </BaseModal>
  );
};
