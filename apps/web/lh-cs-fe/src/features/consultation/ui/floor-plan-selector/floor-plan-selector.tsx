import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '@/shared/ui/typography/typography.styles';

const SelectorContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  border-radius: 6px 0 0 6px;
`;

const SelectorHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SelectorTitle = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 20px;
  color: #111111;
`;

const CountBadge = styled(Box)`
  background: rgba(17, 17, 17, 1);
  border-radius: 4px;
  padding: 2px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CountText = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 16px;
  color: #111111;
  line-height: 1.3;
`;

const SelectorDescription = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 14px;
  color: #666666;
`;

const FloorPlanGrid = styled(Box)`
  flex: 1;
  background: white;
  border-radius: 6px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  overflow-y: auto;
`;

const FloorPlanCard = styled(Box)<{ selected?: boolean }>`
  background: ${(props) => (props.selected ? 'rgba(51, 51, 51, 0.2)' : 'rgba(153, 153, 153, 0.2)')};
  border-radius: 4px;
  box-shadow: ${(props) => props.selected ? '0px 4px 12px 0px rgba(0, 0, 0, 0.05)' : 'none'};
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 0 0 10px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 126px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.1);
  }
`;

const FloorPlanHeader = styled(Box)<{ selected?: boolean }>`
  background: ${(props) => (props.selected ? '#333333' : '#999999')};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
`;

const FloorPlanSize = styled(Typography)`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 16px;
  color: white;
  text-align: center;
`;

const SelectionIndicator = styled(Box)<{ selected?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid white;
  background: ${(props) => (props.selected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.05)')};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  ${(props) => props.selected && `
    &::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
    }
  `}
`;

const FloorPlanImage = styled(Box)`
  width: 70px;
  height: 70px;
  background: #e0e0e0;
  border-radius: 4px;
  background-image: url('https://via.placeholder.com/70x70/e0e0e0/999?text=Floor');
  background-size: cover;
  background-position: center;
`;

interface FloorPlan {
  id: string;
  size: string;
  imageUrl?: string;
}

const floorPlans: FloorPlan[] = [
  { id: '21', size: '21㎡' },
  { id: '25', size: '25㎡' },
  { id: '26', size: '26㎡' },
  { id: '29', size: '29㎡' },
  { id: '31', size: '31㎡' },
  { id: '36', size: '36㎡' },
  { id: '44', size: '44㎡' },
  { id: '46', size: '46㎡' },
];

interface FloorPlanSelectorProps {
  selectedFloorPlan: string | null;
  onFloorPlanSelect: (floorPlanId: string) => void;
}

export const FloorPlanSelector: React.FC<FloorPlanSelectorProps> = ({
  selectedFloorPlan,
  onFloorPlanSelect,
}) => {
  return (
    <SelectorContainer>
      <SelectorHeader>
        <SelectorTitle>평형 선택</SelectorTitle>
        <CountBadge>
          <CountText>8</CountText>
        </CountBadge>
      </SelectorHeader>
      <SelectorDescription>1개의 평형만 선택할 수 있습니다.</SelectorDescription>
      
      <FloorPlanGrid>
        {floorPlans.map((floorPlan) => {
          const isSelected = selectedFloorPlan === floorPlan.id;
          return (
            <FloorPlanCard
              key={floorPlan.id}
              selected={isSelected}
              onClick={() => onFloorPlanSelect(floorPlan.id)}
            >
              <FloorPlanHeader selected={isSelected}>
                <FloorPlanSize>{floorPlan.size}</FloorPlanSize>
                <SelectionIndicator selected={isSelected} />
              </FloorPlanHeader>
              <FloorPlanImage />
            </FloorPlanCard>
          );
        })}
      </FloorPlanGrid>
    </SelectorContainer>
  );
};