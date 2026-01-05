import styled from '@emotion/styled';
import Landing3DContent from './landing-3d-content';
import LandingAIContent from './landing-ai-content';
import { media } from '@/shared/utils';
import { DialogPopup, DialogPopupHeader } from '@/shared/ui';
import { ButtonVariant } from '@/shared/model/button-variants.type';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

interface LandingModalProps {
  contentType: '3d' | 'ai' | 'notice' | 'qna' | null;
  variant: ButtonVariant;
  isOpen: boolean;
  onClose: () => void;
  contentHeaderData: {
    title: string[];
    subtitle: string[];
  };
  modalSize?: {
    width: number;
    height: number;
  };
}

const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 0; /* flex 컨테이너에서 중요 */
  ${media.tablet`
    gap: 16px;
    padding: 16px;
  `}
  ${media.fold`
    padding: 12px;
  `}
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  min-height: 0;

  ${media.tablet`
    gap: 16px;
  `}
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

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  width: 100%;
  flex-shrink: 0; /* 하단 버튼 영역은 항상 고정 크기 유지 */
`;

const ActionButton = styled.button<{ $variant: ButtonVariant }>`
  flex: 1;
  padding: 10px 16px;
  border-radius: 4px;
  border: ${(props) =>
    props.$variant === 'primary' ? '1px solid #0055A2' : '1px solid #90C31F'};
  background-color: none;
  color: ${(props) => (props.$variant === 'primary' ? '#0055A2' : '#90C31F')};

  font-size: 16px;
  line-height: 1.3;

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          &:hover {
            background-color: rgba(0, 85, 162, 0.05);
          }
        `;
      case 'secondary':
        return `
          &:hover {
            background-color: rgba(144, 195, 31, 0.05);
          }
        `;
      default:
        return '';
    }
  }}

  &:focus-visible {
    outline: 2px solid #0066cc;
    outline-offset: 2px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

export const LandingModal: React.FC<LandingModalProps> = ({
  contentType,
  contentHeaderData,
  modalSize,
  variant,
  isOpen,
  onClose,
}) => {
  const {isTablet} = useDeviceDetector();
  if (!isOpen) return null;

  const renderContent = () => {
    switch (contentType) {
      case '3d':
        return <Landing3DContent />;
      case 'ai':
        return <LandingAIContent />;
      default:
        return null;
    }
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      modalSize={modalSize ? { width: modalSize.width, height: modalSize.height } : undefined}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <DialogPopupHeader
          titleComponent={isTablet ? <>{contentHeaderData.title[1]}</> : <>{contentHeaderData.title[0]}</>}
          subTitleComponent={isTablet ? <>{contentHeaderData.subtitle[1]}</> : <>{contentHeaderData.subtitle[0]}</>}
          onClose={onClose}
        />

        <MainContent>
          <ContentArea>{renderContent()}</ContentArea>

          <ActionsContainer>
            <ActionButton $variant={variant} onClick={onClose}>
              닫기
            </ActionButton>
          </ActionsContainer>
        </MainContent>
      </ModalContent>
    </DialogPopup>
  );
};

export default LandingModal;
