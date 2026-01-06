import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from '../typography';

const StyledTabButton = styled.button<{ $isActive: boolean }>`
  height: 40px;
  padding: 0 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;

  color: ${({ $isActive }) => ($isActive ? '#0055a2' : '#6b7280')};

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ $isActive }) =>
      $isActive ? '#0055a2' : 'transparent'};
    transition: background-color 0.2s ease;
  }

  &:hover {
    color: ${({ $isActive }) => ($isActive ? '#0055a2' : '#374151')};
  }
`;
const CountBadge = styled.div`
  background: #ffffff;
  border-radius: 4px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 600;
  font-size: 24px;
  line-height: 1.3;
  color: #0055a2;
`;

interface TabButtonProps {
  // children?: React.ReactNode;
  label: string;
  isActive: boolean;
  filteringCount?: number;
  className?: string;
  onTabChange: () => void;
}
export const TabButton: React.FC<TabButtonProps> = ({label, isActive, filteringCount, onTabChange, className}) => {
  return (
    <StyledTabButton
      $isActive={isActive}
      onClick={() => onTabChange()}
      className={className}
    >
      {label}
      
      {filteringCount && (<CountBadge>{filteringCount}</CountBadge>)}
    </StyledTabButton>
  )
}
    
