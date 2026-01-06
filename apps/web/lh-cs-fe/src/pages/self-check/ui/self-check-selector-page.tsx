import styled from '@emotion/styled';

import { useGetAllTours, useGetTourById } from '@/shared/api/hooks/tour-hooks';
import { ErrorBoundary } from '@/shared/ui/error-boundary';
import { TourListHeader } from '@/shared/ui/tour-list/tour-list-header';
import { useSelfCheckStore } from '../model/self-check.store';
import { TourButton } from '@/shared/ui/tour-list-swiper/tour-button';
import { TourResponse } from '@/shared/model/tour.dto';
import { media } from '@/shared/utils';
import { useNavigate } from 'react-router-dom';
import { useToastMessages } from '@/shared/hooks/use-toast-messages';

const Layout = styled.div`
  padding: 140px 24px 80px;

  ${media.fold`
    padding: 104px 16px 40px;
  `}

  @media screen and (max-width: 1024px) and (orientation: Portrait) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 90px 24px;
  }
`;
const MainContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
  width: 100%;
  max-width: 908px;
  padding: 0 20px;
  margin: 0 auto;

  ${media.tablet`
    max-width: 708px;
  `};
  ${media.fold`
    max-width: 324px;
    padding: 0;
  `};
`;
const FacilityListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 28px;

  ${media.tablet`
    gap: 20px;
  `};
  ${media.fold`
    gap: 20px;
  `};
`;
const SelfCheckButton = styled.button`
  display: flex;
  padding: 16px 12px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
  font-size: 24px;
  line-height: 130%;

  border-radius: 4px;
  background: #0055a2;

  color: #ffffff;

  &:hover:not(:disabled) {
    background: #003d7a;
  }

  &:disabled {
    background: rgba(0, 85, 162, 0.3);
    cursor: not-allowed;
  }
  ${media.tablet`
    position: fixed;
    bottom: 0;
    left: 0;
    border-radius: 0;
  `};
`;
export const SelfCheckSelectorPage = () => {
  const { tourId, setTourId, setSquareMeter } = useSelfCheckStore();
  console.log('Current Tour ID:', tourId);

  const navigate = useNavigate();

  const { showInfo, showError } = useToastMessages();
  const { data: tourDetail, isFetching: isTourLoading } =
    useGetTourById(tourId);

  const { data: toursData } = useGetAllTours();

  const handleSelectTour = (
    tourId: string | undefined,
    squareMeter: number
  ) => {
    console.log('Selected Tour ID:', tourId);
    setTourId(tourId);
    setSquareMeter(squareMeter);
  };

  const navigateToSelfCheckTour = () => {
    if (isTourLoading) {
      showInfo('투어 정보를 불러오는 중입니다. 잠시만 기다려 주세요.');
      return;
    }

    if (!tourDetail) {
      showError('선택한 투어 정보를 찾을 수 없습니다.');
      return;
    }
    navigate(`/self-check/tour/?tourCdnId=${tourDetail.tourCdnId}`);
  };

  return (
    <Layout>
      <ErrorBoundary
        fallback={<div>평형 선택 중 오류가 발생했습니다.</div>}
        resetKeys={[tourId]}
      >
        <MainContainerWrapper>
          <TourListHeader />

          <FacilityListContainer>
            {toursData?.map((option: TourResponse) => (
              <TourButton
                key={'facility' + option.id}
                option={option}
                size='lg'
                onClick={handleSelectTour}
                currentTourId={tourId!}
              />
            ))}
          </FacilityListContainer>

          <SelfCheckButton
            onClick={navigateToSelfCheckTour}
            disabled={tourId === undefined}
          >
            입장하기
          </SelfCheckButton>
        </MainContainerWrapper>
      </ErrorBoundary>
    </Layout>
  );
};
