import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { FacilityTypeEnum } from '@/shared/model/facility-type.enum';
import { MovePointIcon } from '@/shared/ui/icons/move-point-icon';
import { TourFacilityResponse } from '@/shared/model/tour-facility.dto';
import { useGetAllTourFacilitiesByCdnId } from '@/shared/api/hooks/tour-facilities-hooks';
import { media } from '@/shared/utils';

// Styled components matching the XML design
const Container = styled.div<{ isShow: boolean; isPanelhide?: boolean }>`
  position: fixed;
  bottom: 128px;
  left: 50%;
  transform: translateX(-50%)
    translateY(${({ isShow }) => (isShow ? '0' : '30px')});
  z-index: ${({ isPanelhide }) => (isPanelhide ? 0 : 1200)};

  width: 392px;
  background: rgba(255, 255, 255, 1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 1);
  padding: 16px;

  transition:
    transform 0.3s ease-in-out,
    opacity 0.3s ease-in-out;
  opacity: ${({ isShow }) => (isShow ? 1 : 0)};
  @media (max-width: 1024px) {
    width: 320px;
    max-height: 313px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const HeaderTitle = styled.h3`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #111111;
`;

const FilterTabs = styled.div`
  display: flex;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const FilterTab = styled.button<{ isSelected: boolean }>`
  flex: 1;
  padding: 6px 10px;
  background: ${({ isSelected }) => (isSelected ? '#333333' : 'transparent')};
  color: ${({ isSelected }) => (isSelected ? '#f5f5f5' : '#333333')};
  border: none;
  border-radius: 4px;
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isSelected }) =>
      isSelected ? '#333333' : 'rgba(51, 51, 51, 0.1)'};
  }
`;

const LocationList = styled.div`
  background: #f5f5f5;
  border-radius: 4px;
  height: 246px;
  position: relative;

  ${media.tablet`
    height: 184px;
  `}
`;

const ScrollBox = styled.div`
  height: 100%;
  overflow-y: auto;
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(204, 204, 204, 0.8);
    border-radius: 130px;
    width: 4px;
    margin: 0 4px;
  }
`;

const LocationItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  background: ${({ isSelected }) => (isSelected ? '#DDD' : 'transparent')};

  &:hover {
    background: ${({ isSelected }) =>
      isSelected ? '#CCC' : 'rgba(255, 255, 255, 0.5)'};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const LocationNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: rgba(17, 17, 17, 0.2);
  border-radius: 2px;
  font-family: 'Pretendard', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #111111;
  margin-right: 6px;
  flex-shrink: 0;
`;

const LocationName = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #111111;
  line-height: 130%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

interface PositionControlsProps {
  isShow: boolean;
  isPanelhide?: boolean;
  tourId?: string;
  currentSceneId?: number;
  onClose?: () => void;
  onClickLocation?: (facility: TourFacilityResponse) => void;
}

// 카테고리 매핑
const categoryMap = {
  [FacilityTypeEnum.CONSTRUCTION]: '건축',
  [FacilityTypeEnum.MACHINE]: '기계',
  [FacilityTypeEnum.ELECTRICITY]: '전기·통신',
};

const categories = ['건축', '기계', '전기·통신'];

export const PositionControls: React.FC<PositionControlsProps> = ({
  isShow,
  isPanelhide,
  tourId,
  currentSceneId,
  onClose,
  onClickLocation,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('건축');

  // API 데이터 가져오기 (tourCdnId 사용)
  const {
    data: facilities = [],
    isLoading,
    error,
  } = useGetAllTourFacilitiesByCdnId(tourId);

  // 카테고리별로 데이터 분류
  const facilitiesByCategory = useMemo(() => {
    const grouped: Record<string, TourFacilityResponse[]> = {
      건축: [],
      기계: [],
      '전기·통신': [],
    };

    facilities.forEach((facility) => {
      const categoryName = categoryMap[facility.type];
      if (categoryName && grouped[categoryName]) {
        grouped[categoryName].push(facility);
      }
    });

    // displayOrder로 정렬
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => a.displayOrder - b.displayOrder);
    });

    return grouped;
  }, [facilities]);

  const handleLocationClick = (facility: TourFacilityResponse) => {
    if (onClickLocation) onClickLocation(facility);
    if (onClose) onClose();
  };

  return (
    <Container isShow={isShow} isPanelhide={isPanelhide}>
      <Header>
        <HeaderLeft>
          <MovePointIcon width={18} height={20} />
          <HeaderTitle>위치 이동</HeaderTitle>
        </HeaderLeft>
        <CloseButton onClick={onClose}>
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
            <path
              d='M6 6L18 18M6 18L18 6'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </CloseButton>
      </Header>

      <FilterTabs>
        {categories.map((category) => (
          <FilterTab
            key={category}
            isSelected={selectedCategory === category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </FilterTab>
        ))}
      </FilterTabs>

      <LocationList>
        <ScrollBox>
          {isLoading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              로딩 중...
            </div>
          ) : error ? (
            <div
              style={{ padding: '20px', textAlign: 'center', color: '#666' }}
            >
              데이터를 불러오지 못했습니다.
            </div>
          ) : (
            facilitiesByCategory[selectedCategory]?.map((facility, index) => (
              <LocationItem
                key={facility.id + facility.sceneId}
                isSelected={currentSceneId === Number(facility.sceneId)}
                onClick={() => {
                  handleLocationClick(facility);
                }}
              >
                <LocationNumber>{index + 1}</LocationNumber>
                <LocationName>{facility.facilityTitle}</LocationName>
              </LocationItem>
            ))
          )}
        </ScrollBox>
      </LocationList>
    </Container>
  );
};
