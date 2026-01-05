import React from 'react';
import { Box, Typography } from '@mui/material';
import styled from '@emotion/styled';

const ItemContainer = styled(Box)<{ selected: boolean }>`
  display: flex;
  height: 41px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: white;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  ${props => props.selected && `
    background-color: rgba(0, 0, 0, 0.05);
  `}
`;

const ItemContent = styled(Box)`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const ItemNumber = styled(Box)<{ categoryColor: string; isHovered: boolean; selected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: ${props => {
    if (props.selected) return `${props.categoryColor}66`; // 40% 투명도 (가장 진함)
    if (props.isHovered) return `${props.categoryColor}4D`; // 30% 투명도 (중간)
    return `${props.categoryColor}33`; // 20% 투명도 (기본)
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  & > span {
    font-size: 12px;
    font-weight: 700;
    color: ${props => {
      // 각 카테고리별로 진한 색상 적용 (XML에서 확인한 색상)
      switch (props.categoryColor) {
        case '#A38644': return '#46360B'; // 건축 - XML 확인된 색상
        case '#90B25D': return '#3F560E'; // 기계 - XML 확인된 색상  
        case '#446AA3': return '#1A2A4A'; // 전기통신 - XML 추정 색상
        default: return '#333333';
      }
    }};
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;

const ItemTitle = styled(Typography)`
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #111111;
  line-height: 130%;
`;

const SelectIndicator = styled(Box)<{ selected: boolean; categoryColor: string; isHovered: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 0.75px solid ${props => {
    if (props.selected) return props.categoryColor; // 선택됨: 메인 컬러
    if (props.isHovered) return `${props.categoryColor}CC`; // 호버: 80% 투명도
    return '#B3B3B3'; // 기본: 회색
  }};
  background-color: ${props => props.selected ? props.categoryColor : 'transparent'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::after {
    content: '';
    display: ${props => props.selected ? 'block' : 'none'};
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export interface MaintenanceOption {
  id: string;
  number: number;
  title: string;
  category: 'architecture' | 'mechanical' | 'electrical';
}

interface MaintenanceOptionItemProps {
  option: MaintenanceOption;
  selected: boolean;
  categoryColor: string;
  onClick: () => void;
}

export const MaintenanceOptionItem: React.FC<MaintenanceOptionItemProps> = ({
  option,
  selected,
  categoryColor,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <ItemContainer 
      selected={selected} 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ItemContent>
        <ItemNumber categoryColor={categoryColor} isHovered={isHovered} selected={selected}>
          <span>{option.number}</span>
        </ItemNumber>
        <ItemTitle>{option.title}</ItemTitle>
      </ItemContent>
      <SelectIndicator selected={selected} categoryColor={categoryColor} isHovered={isHovered} />
    </ItemContainer>
  );
};