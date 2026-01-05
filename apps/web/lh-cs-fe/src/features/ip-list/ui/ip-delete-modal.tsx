import React from 'react';
import { BaseModal, ModalButton } from '@/shared/ui';

interface IpDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const IpDeleteModal: React.FC<IpDeleteModalProps> = ({
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
      title={'IP 삭제 확인'}
      message={'해당 IP를 삭제하시겠습니까?'}
      noticeTextNode={<>※ 삭제 후 다시 복구할 수 없습니다.</>}
    >
      <ModalButton onClick={onClose} variant={'reject'}>
        취소
      </ModalButton>
      <ModalButton onClick={handleConfirm} variant={'reject'} isFullFilled>
        삭제
      </ModalButton>
    </BaseModal>
  );
};
