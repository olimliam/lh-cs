import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import styled from '@emotion/styled';
import { MaintenanceOptionItem, MaintenanceOption } from './maintenance-option-item';

const CategoryContainer = styled(Box)`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`;

const CategoryHeader = styled(Box)<{ categoryColor: string }>`
  display: flex;
  height: 46px;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  gap: 6px;
  background-color: ${props => props.categoryColor};
  border-radius: 6px 6px 0 0;
`;

const CategoryTitle = styled(Typography)`
  font-family: 'Pretendard', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: white;
  line-height: 130%;
`;

const CategoryBadge = styled(Chip)<{ categoryColor: string }>`
  height: 21px;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
  
  .MuiChip-label {
    padding: 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: ${props => {
      // 각 카테고리별로 진한 색상 적용
      switch (props.categoryColor) {
        case '#A38644': return '#46360B'; // 건축 - 진한 갈색
        case '#90B25D': return '#3A4A1E'; // 기계 - 진한 녹색
        case '#446AA3': return '#1A2A4A'; // 전기통신 - 진한 파랑
        default: return '#333333';
      }
    }};
  }
`;

const OptionsList = styled(Box)`
  flex: 1;
  overflow-y: auto;
  background-color: white;
`;

export interface MaintenanceCategoryData {
  id: 'architecture' | 'mechanical' | 'electrical';
  title: string;
  color: string;
  options: MaintenanceOption[];
}

interface MaintenanceCategorySectionProps {
  category: MaintenanceCategoryData;
  selectedOptionId: string | null;
  onOptionSelect: (optionId: string) => void;
}

export const MaintenanceCategorySection: React.FC<MaintenanceCategorySectionProps> = ({
  category,
  selectedOptionId,
  onOptionSelect,
}) => {
  return (
    <CategoryContainer>
      <CategoryHeader categoryColor={category.color}>
        <CategoryTitle>{category.title}</CategoryTitle>
        <CategoryBadge 
          label={category.options.length} 
          categoryColor={category.color}
        />
      </CategoryHeader>
      
      <OptionsList>
        {category.options.map((option) => (
          <MaintenanceOptionItem
            key={option.id}
            option={option}
            selected={selectedOptionId === option.id}
            categoryColor={category.color}
            onClick={() => onOptionSelect(option.id)}
          />
        ))}
      </OptionsList>
    </CategoryContainer>
  );
};