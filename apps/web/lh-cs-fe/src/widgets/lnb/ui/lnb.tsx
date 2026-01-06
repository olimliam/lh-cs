import React from 'react';
import styled from '@emotion/styled';
import {
  Settings as OperateIcon,
  Assessment as StatisticsIcon,
  KeyboardArrowRight as ArrowIcon,
} from '@mui/icons-material';
import { BASE_FONT_FAMILY } from '@/shared/ui';

interface LnbProps {
  selectedMenu?: string;
  onMenuSelect?: (menu: string) => void;
}

const LnbContainer = styled.div`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  width: 180px;
  align-items: center;
  justify-content: flex-start;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
`;

const MenuSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
`;

const MenuTitle = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
`;

const MenuTitleText = styled.h3`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 700;
  font-size: 18px;
  color: #111111;
  line-height: 26px;
  margin: 0;

  /* 태블릿 범위 (769px-1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 16px;
    line-height: 24px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    font-size: 20px;
    line-height: 28px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    font-size: 16px;
    line-height: 24px;
  }
`;

const MenuItemContainer = styled.div<{ selected?: boolean }>`
  background-color: ${(props) => (props.selected ? '#eeeeee' : 'transparent')};
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;

  /* 태블릿 범위 (769px-1024px) - Figma 기준 */
  @media (min-width: 769px) and (max-width: 1024px) {
    padding: 10px 16px;
    border-radius: 6px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    padding: 12px 16px;
    gap: 8px;
  }

  /* 작은 모바일 (480px 이하) */
  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 6px;
  }

  &:hover {
    background-color: ${(props) => (props.selected ? '#eeeeee' : '#f5f5f5')};
  }
`;

const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const MenuItemText = styled.span<{ selected?: boolean }>`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: ${(props) => (props.selected ? 600 : 500)};
  font-size: 15px;
  color: ${(props) => (props.selected ? '#111111' : 'rgba(17, 17, 17, 0.8)')};
  line-height: 22px;
  flex: 1;

  /* 태블릿 범위 (769px-1024px) */
  @media (min-width: 769px) and (max-width: 1024px) {
    font-size: 14px;
    line-height: 20px;
  }

  /* 데스크톱 (1024px 이상) */
  @media (min-width: 1024px) {
    font-size: 16px;
    line-height: 24px;
  }

  /* 모바일 (768px 이하) */
  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 20px;
  }
`;

const ArrowIconWrapper = styled.div<{ selected?: boolean }>`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${(props) => (props.selected ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.2s ease;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;
`;

const Lnb: React.FC<LnbProps> = ({
  selectedMenu = 'consultation',
  onMenuSelect,
}) => {
  const handleMenuClick = (menu: string) => {
    onMenuSelect?.(menu);
  };

  return (
    <LnbContainer>
      {/* 운영 섹션 */}
      <MenuSection>
        <MenuTitle>
          <IconWrapper>
            <OperateIcon sx={{ fontSize: 24 }} />
          </IconWrapper>
          <MenuTitleText>운영</MenuTitleText>
        </MenuTitle>
        <MenuItemContainer
          selected={selectedMenu === 'consultation'}
          onClick={() => handleMenuClick('consultation')}
        >
          <MenuItemContent>
            <MenuItemText selected={selectedMenu === 'consultation'}>
              3D 가상현실 상담 생성
            </MenuItemText>
            <ArrowIconWrapper selected={selectedMenu === 'consultation'}>
              <ArrowIcon sx={{ fontSize: 18, color: '#666666' }} />
            </ArrowIconWrapper>
          </MenuItemContent>
        </MenuItemContainer>
      </MenuSection>

      {/* 통계 섹션 */}
      <MenuSection>
        <MenuTitle>
          <IconWrapper>
            <StatisticsIcon sx={{ fontSize: 24 }} />
          </IconWrapper>
          <MenuTitleText>통계</MenuTitleText>
        </MenuTitle>
        <MenuItemContainer
          selected={selectedMenu === 'statistics'}
          onClick={() => handleMenuClick('statistics')}
        >
          <MenuItemContent>
            <MenuItemText selected={selectedMenu === 'statistics'}>
              3D 가상현실 상담 내역
            </MenuItemText>
            <ArrowIconWrapper selected={selectedMenu === 'statistics'}>
              <ArrowIcon sx={{ fontSize: 18, color: '#666666' }} />
            </ArrowIconWrapper>
          </MenuItemContent>
        </MenuItemContainer>
      </MenuSection>
    </LnbContainer>
  );
};

export default Lnb;
