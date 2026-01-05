import styled from '@emotion/styled';

interface ScreenSyncStepIndicatorProps {
  currentStep: number; // 1-based
  totalSteps: number;
}

const IndicatorWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
`;

const IndicatorLine = styled.div`
  position: absolute;
  top: 50%;
  left: 12px;
  right: 12px;
  height: 2px;
  background: #e1e9f1;
  transform: translateY(-50%);
`;

const StepCircle = styled.div<{ active: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: ${({ active }) => (active ? '#fff' : 'rgba(0, 85, 162, 0.50)')};
  background: ${({ active }) => (active ? '#0055a2' : '#E1E9F1')};
  opacity: 1;
  z-index: 1;
`;

export const ScreenSyncStepIndicator: React.FC<
  ScreenSyncStepIndicatorProps
> = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <IndicatorWrapper aria-label={`현재 단계 ${currentStep}/${totalSteps}`}>
      <IndicatorLine />
      {steps.map((stepNumber) => (
        <StepCircle
          key={stepNumber}
          active={stepNumber === currentStep}
          aria-label={`${stepNumber}단계`}
        >
          {stepNumber}
        </StepCircle>
      ))}
    </IndicatorWrapper>
  );
};
