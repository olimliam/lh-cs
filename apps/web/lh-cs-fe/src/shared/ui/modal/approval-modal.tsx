import React from 'react';
import { BaseModal } from './base-modal';
import { ModalButton } from './modal-button';
import { UserApprovalStatusEnum } from '@/shared/model/user-approval-status.enum';

interface LogoutModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  approvalStatus: UserApprovalStatusEnum | null;
}

const ApprovalModal: React.FC<LogoutModalProps> = ({
  open,
  onClose,
  onConfirm,
  approvalStatus,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      title={approvalStatus === UserApprovalStatusEnum.APPROVED ? '회원가입 승인' : '회원가입 거절'}
      message={approvalStatus === UserApprovalStatusEnum.APPROVED ? '해당 회원의 가입을 승인하시겠습니까?' : '해당 회원의 가입을 거절하시겠습니까?'}
      noticeTextNode={
        approvalStatus === UserApprovalStatusEnum.REJECTED ? 
        (<>※거절 후 다시 승인 처리할 수 없습니다. <br />
거절한 목록은 거절 항목에서 확인 할 수 있으며, 가입 시
입력한 이름과 전화번호가 삭제되어 표시되지 않습니다.</>
) : (
  <>
  ※승인 후 다시 거부할 수 없습니다.
  </>
)}
    >
      <ModalButton onClick={onClose} variant={approvalStatus === UserApprovalStatusEnum.APPROVED ? 'primary' : 'reject'}>
        취소
      </ModalButton>
      <ModalButton onClick={handleConfirm} variant={approvalStatus === UserApprovalStatusEnum.APPROVED ? 'primary' : 'reject'} isFullFilled>
        {approvalStatus === UserApprovalStatusEnum.APPROVED ? '승인' : '거절'}
      </ModalButton>
    </BaseModal>
  );
};

export default ApprovalModal;
