import { PencilIcon, SettingIcon } from '@/shared/ui';
import { LNBMenuItem, MenuCategoryEnum } from '.';
import { MENU_PERMISSIONS } from '@/shared/model/user-role-permissions';
import StatisticsIcon from '@/shared/ui/icons/statistics-icon';
import { PersonIcon } from '@/shared/ui/icons/person-icon';

// ✅ 메뉴 아이템 정의 (allowedRoles 추가)
export const menuItems: LNBMenuItem[] = [
  {
    id: 'consultation',
    label: '3D 가상현실 상담 생성',
    icon: <SettingIcon />,
    path: '/admin/consultation',
    allowedRoles: MENU_PERMISSIONS.CONSULTATION,
    category: MenuCategoryEnum.OPERATE,
  },
  // {
  //   id: 'vision-ai-analysis',
  //   label: '비전AI 연동 토큰',
  //   icon: <SettingIcon />,
  //   path: '/admin/vision-ai',
  //   allowedRoles: MENU_PERMISSIONS.CONSULTATION,
  //   category: MenuCategoryEnum.OPERATE,
  // },
  {
    id: 'consultation-history',
    label: '3D 가상현실 상담 내역',
    icon: <StatisticsIcon />,
    path: '/admin/consultation/history',
    allowedRoles: MENU_PERMISSIONS.CONSULTATION_HISTORY,
    category: MenuCategoryEnum.STATISTICS,
  },
];

// ✅ 관리 메뉴 (회원, 게시판)
export const managementMenuItems: LNBMenuItem[] = [
  {
    id: 'user-management',
    label: '회원 리스트',
    icon: <PersonIcon />,
    path: '/management/users',
    allowedRoles: MENU_PERMISSIONS.USER_LIST,
    category: MenuCategoryEnum.USER_MANAGE,
  },
  {
    id: 'user-approval',
    label: '가입 승인',
    icon: <PersonIcon />,
    path: '/management/users-approval',
    allowedRoles: MENU_PERMISSIONS.USER_APPROVAL,
    category: MenuCategoryEnum.USER_MANAGE,
  },
  {
    id: 'notice',
    label: '공지사항',
    icon: <PencilIcon />,
    path: '/management/notice',
    allowedRoles: MENU_PERMISSIONS.NOTICE_MANAGEMENT,
    category: MenuCategoryEnum.BOARD_MANAGE,
  },
  {
    id: 'qna',
    label: '자주 묻는 질문',
    icon: <PencilIcon />,
    path: '/management/qna',
    allowedRoles: MENU_PERMISSIONS.QNA_MANAGEMENT,
    category: MenuCategoryEnum.BOARD_MANAGE,
  },
  {
    id: 'ip-list',
    label: '관리자 IP 관리',
    icon: <SettingIcon />,
    path: '/management/ip-list',
    allowedRoles: MENU_PERMISSIONS.IP_MANAGEMENT,
    category: MenuCategoryEnum.SERVICE_MANAGE,
  },
];
