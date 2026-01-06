import styled from '@emotion/styled';
import { AppBar, Toolbar, IconButton, Box, Avatar, Menu } from '@mui/material';
import { Theme } from '@mui/material/styles';

// GNB 메인 컨테이너
export const GNBAppBar = styled(AppBar)<{ theme?: Theme }>`
  background-color: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  z-index: 1200;
  color: #333333;
`;

// GNB Toolbar
export const GNBToolbar = styled(Toolbar)`
  min-height: 64px;
  padding: 0 24px;

  @media (max-width: 768px) {
    min-height: 56px;
    padding: 0 16px;
  }

  @media (max-width: 480px) {
    padding: 0 12px;
  }
`;

// 로고 컨테이너
export const LogoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-right: auto;
`;

// 로고 텍스트
export const LogoText = styled(Box)<{ theme?: Theme }>`
  font-size: 24px;
  font-weight: 700;
  color: #333333;
  font-family: 'Arial, sans-serif';
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

// 서비스 이름
export const ServiceName = styled(Box)<{ theme?: Theme }>`
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  font-family: 'Arial, sans-serif';
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

// 네비게이션 메뉴 컨테이너
export const NavMenuContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  margin-right: 16px;

  @media (max-width: 768px) {
    gap: 4px;
    margin-right: 8px;
  }
`;

// 메뉴 버튼
export const MenuButton = styled(IconButton)<{ theme?: Theme }>`
  color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#ffffff'};
  padding: 8px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// 사용자 정보 컨테이너
export const UserInfoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    gap: 8px;
    padding: 4px;
  }
`;

// 사용자 아바타
export const UserAvatar = styled(Avatar)<{ theme?: Theme }>`
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) =>
    theme?.palette?.secondary?.main || '#6d7f83'};
  font-size: 14px;
  font-weight: 600;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`;

// 사용자 이름
export const UserName = styled(Box)<{ theme?: Theme }>`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#ffffff'};

  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

// 알림 배지
export const NotificationBadge = styled(Box)<{ theme?: Theme }>`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: ${({ theme }) => theme?.palette?.error?.main || '#f44336'};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
`;

// 드롭다운 메뉴
export const UserMenu = styled(Menu)<{ theme?: Theme }>`
  .MuiPaper-root {
    background-color: ${({ theme }) =>
      theme?.palette?.background?.paper || '#ffffff'};
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    margin-top: 8px;
    min-width: 200px;
  }
`;

// 반응형 햄버거 메뉴 (모바일)
export const HamburgerButton = styled(IconButton)<{ theme?: Theme }>`
  color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#ffffff'};
  margin-right: 8px;

  @media (min-width: 769px) {
    display: none;
  }
`;

// 네비게이션 아이템 컨테이너 (데스크톱)
export const DesktopNavItems = styled(Box)`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

// 네비게이션 아이템 버튼
export const NavItemButton = styled(IconButton)<{
  isActive?: boolean;
  theme?: Theme;
}>`
  color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#ffffff'};
  padding: 8px 16px;
  border-radius: 8px;
  background-color: ${({ isActive }) =>
    isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .MuiSvgIcon-root {
    margin-right: 8px;
  }
`;

// 검색 컨테이너 (확장 가능)
export const SearchContainer = styled(Box)<{
  isExpanded?: boolean;
  theme?: Theme;
}>`
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 4px 12px;
  width: ${({ isExpanded }) => (isExpanded ? '300px' : '40px')};
  transition: width 0.3s ease;
  overflow: hidden;

  @media (max-width: 768px) {
    width: ${({ isExpanded }) => (isExpanded ? '200px' : '40px')};
  }

  @media (max-width: 480px) {
    width: ${({ isExpanded }) => (isExpanded ? '150px' : '32px')};
    border-radius: 16px;
  }

  input {
    background: transparent;
    border: none;
    outline: none;
    color: ${({ theme }) => theme?.palette?.primary?.contrastText || '#ffffff'};
    font-size: 14px;
    width: 100%;
    margin-left: 8px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
  }
`;
