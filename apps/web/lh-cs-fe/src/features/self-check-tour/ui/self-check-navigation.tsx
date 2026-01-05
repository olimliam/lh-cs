import { PositionControls } from '@/features/tour-navigation/ui/position-controls';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';
import { LocationIcon } from '@/shared/ui';
import { ExitIcon } from '@/shared/ui/icons/exit-icon';
import { media } from '@/shared/utils';
import styled from '@emotion/styled';
import { useViewer } from '@packages/traveler';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SelfCheckNavigationProps {
  tourCdnId: string;
  showControls: boolean;
  currentSceneId: number | undefined;
  onClick: () => void;
  handleClickLocation?: (facility: TourFacilityResponse) => void;
}

const SelfCheckNavigationWrapper = styled.div<{ isTravelerPopupOpen: boolean }>`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  width: 392px;
  padding: 10px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  border: 1px solid #fff;
  background: rgba(255, 255, 255, 0.6);
  z-index: ${({ isTravelerPopupOpen }) => (isTravelerPopupOpen ? 0 : 1300)};

  ${media.tablet`
    width: 328px;
  `}
`;

const NavButton = styled.button<{ showPositionControls?: boolean }>`
  display: flex;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 50%;
  border-radius: 4px;
  border: 1px solid #eee;
  background: #fff;
  transition: all 0.2s ease;

  & span {
    font-weight: 700;
    line-height: 130%; /* 20.8px */
    color: #333;
  }

  ${({ showPositionControls }) =>
    showPositionControls
      ? `
      background: #0055A2;

      & span {
        color: #fff;
      }
    `
      : `
      &:hover {
        border: 1px solid rgba(0, 85, 162, 0.3);
        background: #f8fcff;
      }
    `}
`;

export const SelfCheckNavigation = ({
  tourCdnId,
  currentSceneId,
  handleClickLocation,
}: SelfCheckNavigationProps) => {
  const { getIsPopupOpen } = useViewer();
  const navigate = useNavigate();
  const [showPositionControls, setShowPositionControls] =
    useState<boolean>(false);

  const handleClosePositionControls = () => {
    setShowPositionControls(false);
  };
  return (
    <>
      <SelfCheckNavigationWrapper isTravelerPopupOpen={getIsPopupOpen()}>
        <NavButton
          onClick={() => setShowPositionControls(!showPositionControls)}
          showPositionControls={showPositionControls}
        >
          <LocationIcon fill={showPositionControls ? '#fff' : '#333'} />
          <span>위치 이동</span>
        </NavButton>
        <NavButton onClick={() => navigate('/self-check')}>
          <ExitIcon color='#333' />
          <span>나가기</span>
        </NavButton>
      </SelfCheckNavigationWrapper>
      {showPositionControls && (
        <PositionControls
          isPanelhide={getIsPopupOpen()}
          isShow={showPositionControls}
          tourId={tourCdnId}
          currentSceneId={currentSceneId}
          onClose={handleClosePositionControls}
          onClickLocation={handleClickLocation}
        />
      )}
    </>
  );
};
