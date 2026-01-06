import React from 'react';
import { BaseModal } from './base-modal';
import { ModalButton } from './modal-button';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  open,
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
      title='로그아웃'
      message='로그아웃 하시겠습니까?'
    >
      <ModalButton onClick={onClose} variant='primary_02'>
        취소
      </ModalButton>
      <ModalButton onClick={handleConfirm} variant='primary_02' isFullFilled>
        로그아웃
      </ModalButton>
    </BaseModal>
  );
};

export default LogoutModal;
