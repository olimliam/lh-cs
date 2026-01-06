import React from 'react';
import { BaseModal } from './base-modal';
import { ModalButton } from './modal-button';

interface ConsultationEndModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConsultationEndModal: React.FC<ConsultationEndModalProps> = ({
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
      title='상담실 종료'
      message='상담실을 종료하시겠습니까?'
    >
      <ModalButton onClick={onClose} variant='primary'>
        취소
      </ModalButton>
      <ModalButton onClick={handleConfirm} variant='primary' isFullFilled>
        종료
      </ModalButton>
    </BaseModal>
  );
};

export default ConsultationEndModal;
