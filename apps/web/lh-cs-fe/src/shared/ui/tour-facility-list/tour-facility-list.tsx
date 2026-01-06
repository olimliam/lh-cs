import { FacilityTypeEnum } from '@/shared/model/facility-type.enum';
import styled from '@emotion/styled';
import React, { useEffect, useMemo } from 'react';
// import { FacilityListHeader } from './facility-list-header';
import { FacilitySection } from './facility-section';
import { useGetAllTourFacilities } from '@/shared/api/hooks/tour-facilities-hooks';
import { CreateTourContentHeader } from '../create-tour-content-header';
import { media } from '@/shared/utils';

export const HiddenScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  /* 메인 컨테이너일 때 가로 방향으로 배치 */
  &.flex {
    flex-direction: row;
  }

  ${media.tablet`
    height: 100%;
    max-height: 242px;
  `}
`;

export const ListContainer = styled.div`
  display: flex;
  height: 622px;
  width: 100%;
  background: #fff;
  border-radius: 4px;
`;

interface TourFacilityListProps {
  tourId: string | undefined;
  facilityId: string | undefined;
  onSelectFacility: (facilityId: string | undefined) => void;
}

export const TourFacilityList: React.FC<TourFacilityListProps> = ({
  tourId,
  facilityId,
  onSelectFacility,
}) => {
  const { data: tourFacilitiesData, refetch } = useGetAllTourFacilities(tourId);

  useEffect(() => {
    if (tourId) {
      refetch();
    }
  }, [tourId, refetch]);

  const handleSelectFacility = (selectedFacilityId: string | undefined) => {
    onSelectFacility(selectedFacilityId);
  };

  const facilities = useMemo(() => {
    if (!tourFacilitiesData) {
      return [];
    }

    if (Array.isArray(tourFacilitiesData)) {
      return tourFacilitiesData;
    }

    console.warn('Unexpected tourFacilitiesData format', tourFacilitiesData);
    return [];
  }, [tourFacilitiesData]);

  const constructions = useMemo(
    () =>
      facilities.filter(
        (facility) => facility.type === FacilityTypeEnum.CONSTRUCTION
      ),
    [facilities]
  );
  const machines = useMemo(
    () =>
      facilities.filter(
        (facility) => facility.type === FacilityTypeEnum.MACHINE
      ),
    [facilities]
  );
  const electricals = useMemo(
    () =>
      facilities.filter(
        (facility) => facility.type === FacilityTypeEnum.ELECTRICITY
      ),
    [facilities]
  );

  const totalLength =
    constructions.length + machines.length + electricals.length;

  return (
    <div className='flex h-full flex-1 flex-col gap-3'>
      {/* <FacilityListHeader count={totalLength} /> */}
      <CreateTourContentHeader
        contentTitle='유지보수 설비 선택'
        subTitle='건축, 기계, 전기·통신 항목에서 1개만 선택할 수 있습니다.'
        count={totalLength}
      />

      <HiddenScrollContainer className='flex h-full w-full overflow-hidden rounded-[6px] bg-[#fff]'>
        {/* 건축 */}
        <FacilitySection
          title='건축'
          backgroundColor='#a38644'
          textColor='#46360b'
          items={constructions}
          selectedId={facilityId}
          onSelect={handleSelectFacility}
          selectedBgColor='bg-[#fffcf7]'
          numberBgColor='rgba(163,134,68,0.2)'
          numberTextColor='#46360b'
          selectedBorderColor='border-[#c3971f] bg-[#c3971f]'
          selectedCheckmarkBg='#c3971f'
          roundedClass='rounded-tl-[6px]'
        />
        {/* 기계 */}
        <FacilitySection
          title='기계'
          backgroundColor='#90b25d'
          textColor='#3f560e'
          items={machines}
          selectedId={facilityId}
          onSelect={handleSelectFacility}
          selectedBgColor='bg-[#f7ffef]'
          numberBgColor='rgba(144,178,93,0.2)'
          numberTextColor='#3f560e'
          selectedBorderColor='border-[#8fc31f] bg-[#8fc31f]'
          selectedCheckmarkBg='#8fc31f'
        />
        {/* 전기/통신 */}
        <FacilitySection
          title='전기 · 통신'
          backgroundColor='#446aa3'
          textColor='#0a2145'
          items={electricals}
          selectedId={facilityId}
          onSelect={handleSelectFacility}
          selectedBgColor='bg-[#eff5ff]'
          numberBgColor='rgba(68,106,163,0.2)'
          numberTextColor='#0a2145'
          selectedBorderColor='border-[#1f61c3] bg-[#1f61c3]'
          selectedCheckmarkBg='#1f61c3'
          roundedClass='rounded-tr-[6px]'
        />
      </HiddenScrollContainer>
    </div>
  );
};
