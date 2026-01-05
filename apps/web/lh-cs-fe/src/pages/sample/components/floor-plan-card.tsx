import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

// Custom Radio Button Component matching actual design
const CustomRadio = styled(Box)<{ selected: boolean; state: 'default' | 'hover' | 'selected' }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${props => {
    if (props.selected) return 'white';
    if (props.state === 'hover') return '#BDBDBD';
    return 'white';
  }};
  background-color: ${props => props.selected ? 'white' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.selected ? '#333' : 'transparent'};
    transition: all 0.2s ease;
  }
`;

const CardContainer = styled(Box)<{ selected: boolean; state: 'default' | 'hover' | 'selected' }>`
  position: relative;
  display: flex;
  height: 125px;
  width: 126px;
  cursor: pointer;
  flex-direction: column;
  border-radius: 8px;
  background-color: #F5F5F5;
  overflow: hidden;
  transition: all 0.2s ease;
  
  /* Default state */
  box-shadow: none;
  
  /* Hover state */
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled(Box)<{ selected: boolean; state: 'default' | 'hover' | 'selected' }>`
  display: flex;
  height: 33px;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background-color: ${props => {
    if (props.selected) return '#333333';
    if (props.state === 'hover') return '#BDBDBD';
    return '#999999';
  }};
  transition: background-color 0.2s ease;
`;

const AreaText = styled(Typography)<{ selected: boolean; state: 'default' | 'hover' | 'selected' }>`
  font-family: 'Pretendard', sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 130%;
  color: white;
  transition: color 0.2s ease;
`;

const PlanImagePlaceholder = styled(Box)`
  margin: 12px;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background-color: white;
  transition: background-color 0.2s ease;
`;

const PlaceholderText = styled(Typography)`
  font-size: 12px;
  color: #9E9E9E;
  transition: color 0.2s ease;
`;

interface FloorPlan {
  id: string;
  area: string;
  image?: string;
}

interface FloorPlanCardProps {
  plan: FloorPlan;
  selected: boolean;
  onClick: () => void;
}

export const FloorPlanCard: React.FC<FloorPlanCardProps> = ({
  plan,
  selected,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const getState = (): 'default' | 'hover' | 'selected' => {
    if (selected) return 'selected';
    if (isHovered) return 'hover';
    return 'default';
  };
  
  const state = getState();
  
  return (
    <CardContainer 
      selected={selected} 
      state={state}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader selected={selected} state={state}>
        <AreaText selected={selected} state={state}>
          {plan.area}
        </AreaText>
        <CustomRadio selected={selected} state={state} />
      </CardHeader>

      <PlanImagePlaceholder>
        <PlaceholderText>
          평면도
        </PlaceholderText>
      </PlanImagePlaceholder>
    </CardContainer>
  );
};