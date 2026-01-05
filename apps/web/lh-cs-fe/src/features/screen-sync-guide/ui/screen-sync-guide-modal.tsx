import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { BASE_FONT_FAMILY } from '@/shared/ui/typography';
import type {
  ScreenSyncGuideButtonLabels,
  ScreenSyncStep,
} from '../model/screen-sync-guide.types';
import { ScreenSyncStepIndicator } from './components/screen-sync-step-indicator';
import { ScreenSyncImageSlot } from './components/screen-sync-image-slot';
// import { ScreenSyncLeftButton } from './components/screen-sync-left-button';
// import { ScreenSyncRightButton } from './components/screen-sync-right-button';
import { Button } from '@/shared/ui';
import { media } from '@/shared/utils';

interface ScreenSyncGuideModalProps {
  open: boolean;
  onClose: () => void;
  onSkip?: () => void | Promise<void>;
  onConfirm?: () => void | Promise<void>;
  disabled: boolean;
  steps?: ScreenSyncStep[];
  buttonLabels?: Partial<ScreenSyncGuideButtonLabels>;
  initialStep?: number;
}

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    width: 500px;
    max-width: 90vw;
    border-radius: 12px;
    padding: 24px;
    background: #ffffff;
    box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);

    ${media.fold`
      padding: 16px;
      max-width: 94vw;
      margin: 16px;
    `}
  }

  .MuiBackdrop-root {
    background-color: rgba(0, 0, 0, 0.6);
  }
`;

const Header = styled(DialogTitle)`
  padding: 0;
  margin: 0 0 16px 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  ${media.fold`
    flex-direction: column;
    gap: 12px;
  `}
`;

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  color: #111111;
  letter-spacing: -0.01em;
`;

const Description = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: #333333;
  letter-spacing: -0.01em;
`;

const Content = styled(DialogContent)`
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const Actions = styled(DialogActions)`
  margin-top: 16px;
  padding: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
`;

const SyncSpinner = styled(CircularProgress)`
  color: inherit;
`;

const DEFAULT_STEPS: ScreenSyncStep[] = [
  {
    id: 1,
    title: '상담 화면 동기화 가이드',
    description: (
      <>
        <strong>상담실 화면만 선택</strong>하여 공유해 주세요.
      </>
    ),
    caption: (
      <>
        <strong>※ ‘창’ 탭</strong>을 먼저 클릭해 주세요.
      </>
    ),
    imageSrc: '/images/img-sharing-guide-01',
  },
  {
    id: 2,
    title: '상담 화면 동기화 가이드',
    description: (
      <>
        <strong>상담실 화면만 선택</strong>하여 공유해 주세요.
      </>
    ),
    caption: (
      <>
        <strong>※ ‘내집속속’, ‘LH집속속’</strong> 창을 선택해야 합니다.
      </>
    ),
    imageSrc: '/images/img-sharing-guide-02',
  },
  {
    id: 3,
    title: '상담 화면 동기화 가이드',
    description: (
      <>
        <strong>상담실 화면만 선택</strong>하여 공유해 주세요.
      </>
    ),
    caption: (
      <>
        ※ 반드시 <strong>‘내집속속’, ‘LH집속속’ 만</strong> 선택해야 합니다.
      </>
    ),
    imageSrc: '/images/img-sharing-guide-03',
  },
];

const DEFAULT_BUTTON_LABELS: ScreenSyncGuideButtonLabels = {
  skip: '건너뛰기',
  previous: '이전',
  next: '다음',
  confirm: '확인',
};

export const ScreenSyncGuideModal: React.FC<ScreenSyncGuideModalProps> = ({
  open,
  onClose,
  onSkip,
  onConfirm,
  disabled,
  steps = DEFAULT_STEPS,
  buttonLabels,
  initialStep = 0,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const labels = useMemo(
    () => ({ ...DEFAULT_BUTTON_LABELS, ...buttonLabels }),
    [buttonLabels]
  );

  useEffect(() => {
    if (open) {
      setCurrentStepIndex(initialStep);
    }
  }, [open, initialStep]);

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const executeSkip = useCallback(async () => {
    if (onSkip) {
      await onSkip();
      return;
    }

    if (onConfirm) {
      await onConfirm();
    }
  }, [onConfirm, onSkip]);

  const executeConfirm = useCallback(async () => {
    if (onConfirm) {
      await onConfirm();
      return;
    }

    if (onSkip) {
      await onSkip();
    }
  }, [onConfirm, onSkip]);

  const handleLeftClick = useCallback(async () => {
    if (isFirstStep) {
      await executeSkip();
      onClose();
      return;
    }

    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, [executeSkip, isFirstStep, onClose]);

  const handleRightClick = useCallback(async () => {
    if (!isLastStep) {
      setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
      return;
    }

    await executeConfirm();
    onClose();
  }, [executeConfirm, isLastStep, onClose, totalSteps]);

  return (
    <StyledDialog open={open} onClose={onClose}>
      <Header>
        <TitleGroup>
          <Title>{currentStep?.title}</Title>
          <Description>{currentStep?.description}</Description>
        </TitleGroup>
        <div className='flex items-start gap-2'>
          <ScreenSyncStepIndicator
            currentStep={currentStep?.id ?? currentStepIndex + 1}
            totalSteps={totalSteps}
          />
        </div>
      </Header>

      <Content>
        <ScreenSyncImageSlot step={currentStep} />
      </Content>

      <Actions>
        <Button
          fullWidth
          variant='outlinePrimary'
          size={'md'}
          onClick={handleLeftClick}
          color='inherit'
        >
          {isFirstStep ? labels.skip : labels.previous}
        </Button>
        <Button
          className='!ml-0'
          fullWidth
          disabled={disabled}
          variant='primary'
          onClick={handleRightClick}
        >
          {disabled && <SyncSpinner size={16} thickness={5} />}
          {isLastStep ? labels.confirm : labels.next}
        </Button>
        {/* <ScreenSyncLeftButton
          label={isFirstStep ? labels.skip : labels.previous}
          onClick={handleLeftClick}
        />
        <ScreenSyncRightButton
          label={isLastStep ? labels.confirm : labels.next}
          onClick={handleRightClick}
        /> */}
      </Actions>
    </StyledDialog>
  );
};
