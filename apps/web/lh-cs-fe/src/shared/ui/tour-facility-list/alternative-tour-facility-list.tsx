import { BASE_FONT_FAMILY } from '@/shared/ui';
import styled from '@emotion/styled';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
// import { FacilityListHeader } from './facility-list-header';
import { media } from '@/shared/utils';
import { useEffect } from 'react';
import {
  HiddenScrollContainer,
  ListContainer,
} from '@/shared/ui/tour-facility-list/tour-facility-list';
import { CreateTourContentHeader } from '../create-tour-content-header';

const AlternativeBox = styled.div`
  display: flex;
  padding: 24px 30px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  flex: 1 0 0;
  align-self: stretch;
  margin: 20px;

  border-radius: 6px;
  border: 1px dashed rgba(17, 17, 17, 0.4);

  background: #eee;

  ${media.tablet`
    margin: 0;
    height: 242px;
  `}
`;

const AlternativeText = styled.p`
  overflow: hidden;
  color: #727171;

  text-overflow: ellipsis;
  font-family: ${BASE_FONT_FAMILY};
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 130%; /* 20.8px */
`;

export const AlternativeTourFacilityList = () => {
  const { isTablet } = useDeviceDetector();
  useEffect(() => {
    console.log('isTablet', isTablet);
  }, [isTablet]);
  return (
    <div className='flex h-full flex-1 flex-col gap-3'>
      <CreateTourContentHeader
        contentTitle='유지보수 설비 선택'
        subTitle='건축, 기계, 전기·통신 항목에서 1개만 선택할 수 있습니다.'
        count={0}
      />

      {isTablet ? (
        <HiddenScrollContainer className='flex w-full overflow-hidden rounded-[6px] bg-[#fff]'>
          <AlternativeBox>
            <AlternativeText>평형을 선택해 주세요.</AlternativeText>
          </AlternativeBox>
        </HiddenScrollContainer>
      ) : (
        <ListContainer>
          <AlternativeBox>
            <AlternativeText>평형을 선택해 주세요.</AlternativeText>
          </AlternativeBox>
        </ListContainer>
      )}
    </div>
  );
};
