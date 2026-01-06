import { launchVisionAiWindow } from '@/features/vision-ai/lib/launch-vision-ai-window';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';
import { ArrowRightIcon } from '@/shared/ui';
import { useState } from 'react';
import { MoveToButton } from '../style/lnb-style';

const MoveToAiReviewButton = () => {
  const toastMessages = useToastMessages();
  const [isOpening, setIsOpening] = useState(false);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return '비전 AI 창을 여는 동안 알 수 없는 오류가 발생했습니다.';
  };

  const handleOpenWindow = async () => {
    if (isOpening) {
      return;
    }

    setIsOpening(true);
    try {
      const { url } = await launchVisionAiWindow();
      toastMessages.showSuccess(
        `비전 AI 분석 결과 창을 새 창에서 열었습니다.\n${url}`
      );
    } catch (error) {
      toastMessages.showError(getErrorMessage(error));
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <MoveToButton onClick={() => handleOpenWindow()}>
      <span>비전 AI 분석 결과 조회</span>
      <ArrowRightIcon fill={'#999'} width={18} height={18} />
    </MoveToButton>
  );
};

export default MoveToAiReviewButton;
