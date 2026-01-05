import { Button, DialogPopup, DialogPopupHeader } from '@/shared/ui';
import styled from '@emotion/styled';
import { RegisterPolicyContent } from './register-policy-content';

const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 0; /* flex 컨테이너에서 중요 */
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-height: 0;
`;
const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  /* 스크롤바 스타일링 (웹킷 기반 브라우저) */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
`;

interface policyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegisterPolicyModal: React.FC<policyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <DialogPopup
      isOpen={isOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      modalSize={{ width: 560, height: 400 }}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <DialogPopupHeader
          titleComponent={<>개인정보 수집 및 이용 동의</>}
          subTitleComponent={
            <>
              한국토지주택공사는 ‘LH집속속’의 상담사 및 관리자 서비스 제공을
              위해
              <br />
              아래와 같이 개인정보를 수집 이용하고자 합니다.
            </>
          }
          onClose={onClose}
        ></DialogPopupHeader>

        <MainContent>
          <ContentArea>{<RegisterPolicyContent />}</ContentArea>

          <Button fullWidth variant={'primary'} size={'md'} onClick={onClose}>
            닫기
          </Button>
        </MainContent>
      </ModalContent>
    </DialogPopup>
  );
};
