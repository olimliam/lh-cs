import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '@/shared/ui/typography';
import type { ScreenSyncStep } from '../../model/screen-sync-guide.types';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';

interface ScreenSyncImageSlotProps {
  step: ScreenSyncStep;
}

const ImageContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f7fa 0%, #eef3f8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px #e1e9f1;
`;

const StepImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  letter-spacing: -0.01em;
`;

const Caption = styled.div`
  width: 100%;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 14px;
  line-height: 20px;
  color: #333333;
  text-align: left;
  letter-spacing: -0.01em;
`;

export const ScreenSyncImageSlot: React.FC<ScreenSyncImageSlotProps> = ({
  step,
}) => {
  const { isFold } = useDeviceDetector();
  return (
    <>
      <ImageContainer>
        {step.imageSrc ? (
          <StepImage
            src={!isFold ? `${step.imageSrc}.png` : `${step.imageSrc}-mo.png`}
            alt={step.title}
          />
        ) : (
          <Placeholder>400x300 가이드 이미지를 배치해 주세요.</Placeholder>
        )}
      </ImageContainer>
      {step.caption && <Caption>{step.caption}</Caption>}
    </>
  );
};
