import { CurrentContentBadge } from './current-content-badge';
import { CalenderIcon, DialogPopup } from '@/shared/ui';
import { CloseIcon } from '@/shared/ui/icons/close-icon';
import { LandingNoticeContent } from './landing-notice-content';
import { ButtonVariant } from '@/shared/model/button-variants.type';
import { dateGenerator } from '../lib/generator.date.util';
import {
  ActionButton,
  ActionsContainer,
  CloseButton,
  ContentArea,
  Header,
  MainContent,
  ModalContent,
  Subtitle,
  Title,
} from '../style/popup-styles';
import { usePublicQnaById } from '../../../shared/api/hooks/qna-hooks';
import { NoticeFaqItemResponseById } from '@/shared/model/notice-api-type';

interface FaqListModalProps {
  contentType: 'notice' | 'qna' | null;
  variant: ButtonVariant;
  isOpen: boolean;
  onClose: () => void;
  selectedItemId: string | null;
}

export const FaqListModal: React.FC<FaqListModalProps> = ({
  contentType,
  selectedItemId,
  variant,
  isOpen,
  onClose,
}) => {
  const {
    data: qnaItemData,
    // isLoading: isNoticeLoading,
    // error: noticeError,
  } = usePublicQnaById(selectedItemId);

  const data = qnaItemData?.data as NoticeFaqItemResponseById | undefined;
  const title = data?.title ?? '제목 없음';
  const content = data?.content ?? '';
  const attachments = data?.attachments ?? [];
  const createdAt = data?.createdAt ?? '';
  // const fileUrl = data?.fileUrl;
  // const fileName = data?.fileName;

  if (!isOpen) return null;

  return (
    <DialogPopup
      isOpen={isOpen}
      onClose={onClose}
      container={() => document.getElementById('root')}
      modalSize={{ width: 720, height: 400 }}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <Header>
          <div>
            <CurrentContentBadge contentType={contentType} />
            <Title>{title}</Title>
            <Subtitle>
              <CalenderIcon fill={'#666'} />
              {dateGenerator(createdAt)}
            </Subtitle>
          </div>

          <CloseButton onClick={onClose} aria-label='모달 닫기'>
            <CloseIcon width={36} height={36} />
          </CloseButton>
        </Header>

        <MainContent>
          <ContentArea>
            {
              <LandingNoticeContent
                content={content}
                attachments={attachments}
                // fileUrl={fileUrl}
                // fileName={fileName ?? undefined}
              />
            }
          </ContentArea>

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
