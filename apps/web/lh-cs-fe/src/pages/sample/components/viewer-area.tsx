import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import styled from '@emotion/styled';
import {
  MaintenanceCategorySection,
  MaintenanceCategoryData,
} from './maintenance-category-section';

const ViewerContainer = styled(Box)`
  display: flex;
  height: 100%;
  flex: 1;
  flex-direction: column;
  gap: 12px;
`;

const HeaderSection = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const HeaderTitleRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const HeaderTitle = styled(Typography)`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #111111;
  line-height: 130%;
`;

export const HeaderBadge = styled(Chip)`
  height: 21px;
  min-width: 32px;
  background-color: rgba(17, 17, 17, 0.1);
  border-radius: 4px;

  .MuiChip-label {
    padding: 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: #111111;
  }
`;

const HeaderDescription = styled(Typography)`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #666666;
  line-height: 130%;
`;

const CategoriesContainer = styled(Box)`
  display: flex;
  flex: 1;
  gap: 0;
  border-radius: 6px;
  overflow: hidden;
  height: 622px;
`;

interface ViewerAreaProps {
  selectedPlan?: MaintenanceCategoryData[] | null;
}

export const ViewerArea: React.FC<ViewerAreaProps> = (
  props: ViewerAreaProps
) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // 전체 옵션 개수 계산
  const totalOptionsCount = props.selectedPlan?.reduce(
    (total, category) => total + category.options.length,
    0
  );

  const handleOptionSelect = (optionId: string) => {
    // 하나만 선택되도록 함
    setSelectedOptionId((prevSelected) =>
      prevSelected === optionId ? null : optionId
    );
  };

  return (
    <ViewerContainer>
      <HeaderSection>
        <HeaderTitleRow>
          <HeaderTitle>유지보수 설비 선택</HeaderTitle>
          <HeaderBadge label={totalOptionsCount} />
        </HeaderTitleRow>
        <HeaderDescription>
          건축, 기계, 전기·통신 항목에서 1개만 선택할 수 있습니다.
        </HeaderDescription>
      </HeaderSection>

      <CategoriesContainer>
        {(props.selectedPlan ? props.selectedPlan : []).map((category) => (
          <MaintenanceCategorySection
            key={category.id}
            category={category}
            selectedOptionId={selectedOptionId}
            onOptionSelect={handleOptionSelect}
          />
        ))}
      </CategoriesContainer>
    </ViewerContainer>
  );
};
