import { ArrowLeftIcon, Button } from '@/shared/ui';
import { BackButton, ContentBoxHeader } from '../style/board-style';

interface TextEditorHeaderProps {
  handleUndoPage: () => void;
  handleSubmit: () => void;
  submitLabel?: string;
  loadingLabel?: string;
  isSubmitting?: boolean;
}
export const TextEditorHeader = ({
  handleUndoPage,
  handleSubmit,
  submitLabel = '등록',
  // loadingLabel = '업로드 중...',
  isSubmitting = false,
}: TextEditorHeaderProps) => {
  return (
    <ContentBoxHeader>
      <BackButton type='button' onClick={handleUndoPage}>
        <ArrowLeftIcon width={24} height={24} fill={'#727171'} /> 돌아가기
      </BackButton>
      <div>
        <Button
          className='!w-[112px]'
          size={'md'}
          variant={'outlinePrimary'}
          onClick={handleUndoPage}
        >
          취소
        </Button>
        <Button
          className='!ml-4 !w-[112px]'
          size={'md'}
          variant={'primary'}
          isLoading={isSubmitting}
          onClick={() => handleSubmit()}
          disabled={isSubmitting}
        >
          {isSubmitting ? <></> : submitLabel}
        </Button>
      </div>
    </ContentBoxHeader>
  );
};
