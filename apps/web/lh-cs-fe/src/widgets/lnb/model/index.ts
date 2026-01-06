import { UserRoleEnum } from '@/shared/model/user-role.enum';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavigationItem[];
  isActive?: boolean;
  badge?: number;
}

export interface LNBWidgetProps {
  navigationItems: NavigationItem[];
  isCollapsed?: boolean;
  onItemClick: (item: NavigationItem) => void;
  onToggleCollapse?: () => void;
  currentPath?: string;
}

export enum MenuCategoryEnum {
  OPERATE = 'OPERATE',
  STATISTICS = 'STATISTICS',
  USER_MANAGE = 'USER_MANAGE', // 상담원 권한 추가
  BOARD_MANAGE = 'BOARD_MANAGE',
  SERVICE_MANAGE = 'SERVICE_MANAGE',
}

export interface LNBMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles: UserRoleEnum[]; // ✅ 허용된 역할 목록
  category: MenuCategoryEnum;
}
