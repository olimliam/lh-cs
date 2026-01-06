import { UserRoleEnum } from '@/shared/model/user-role.enum';

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  role: UserRoleEnum;
  avatar?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

export interface UserAction {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface GNBWidgetProps {
  user: UserProfile;
  notifications?: Notification[];
  onMenuToggle: () => void;
  onUserMenuClick: (action: string) => void;
  onNotificationClick: (notificationId: string) => void;
  isMobileMenuOpen?: boolean;
  handleTabletLnbToggle: () => void;
  toggleLogoutModal?: () => void;
}
