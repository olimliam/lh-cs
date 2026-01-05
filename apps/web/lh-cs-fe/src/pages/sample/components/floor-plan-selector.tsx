import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';
import { FloorPlanCard } from './floor-plan-card';
import { HeaderBadge } from './viewer-area';

const SelectorContainer = styled(Box)`
  display: flex;
  height: 100%;
  width: 288px;
  flex-direction: column;
  background-color: #f5f5f5;
`;

const HeaderSection = styled(Box)`
  margin-bottom: 12px;
`;

const TitleRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
`;

const PlanGrid = styled(Box)`
  flex: 1;
  overflow: auto;
  border-radius: 6px;
  background-color: #fff;
  padding: 12px;
`;

const PlanCardsContainer = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

interface FloorPlan {
  id: string;
  area: string;
  image?: string;
}

interface FloorPlanSelectorProps {
  floorPlans: FloorPlan[];
  selectedPlan: string | null;
  onPlanSelect: (planId: string) => void;
}

export const FloorPlanSelector: React.FC<FloorPlanSelectorProps> = ({
  floorPlans,
  selectedPlan,
  onPlanSelect,
}) => {
  return (
    <SelectorContainer>
      <HeaderSection>
        <TitleRow>
          <Typography
            variant='h6'
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#111111',
            }}
          >
            평형 선택
          </Typography>
          <HeaderBadge label={floorPlans.length} />
        </TitleRow>
        <Typography
          variant='body2'
          sx={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#666666',
          }}
        >
          1개의 평형만 선택할 수 있습니다.
        </Typography>
      </HeaderSection>

      <PlanGrid>
        <PlanCardsContainer>
          {floorPlans.map((plan) => (
            <FloorPlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan === plan.id}
              onClick={() => onPlanSelect(plan.id)}
            />
          ))}
        </PlanCardsContainer>
      </PlanGrid>
    </SelectorContainer>
  );
};
