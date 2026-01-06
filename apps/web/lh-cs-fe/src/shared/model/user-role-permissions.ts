import { UserRoleEnum } from './user-role.enum';

/**
 * 역할별 표시 레이블
 */
export const ROLE_LABEL_MAP: Record<UserRoleEnum, string> = {
  [UserRoleEnum.SUPER_ADMIN]: '운영관리자',
  [UserRoleEnum.ADMIN]: '관리자',
  [UserRoleEnum.CONSULTANT]: '상담사',
  [UserRoleEnum.VISITOR]: '방문자',
};

/**
 * ✅ 메뉴별 접근 가능한 역할 정의
 * - SUPER_ADMIN과 ADMIN은 모든 메뉴 접근 가능
 * - CONSULTANT는 제한된 메뉴만 접근
 */
export const MENU_PERMISSIONS: Record<string, UserRoleEnum[]> = {
  // ✅ 상담 관련 메뉴
  CONSULTATION: [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
  ],

  // ✅ 상담 내역
  CONSULTATION_HISTORY: [
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
  ],

  // ✅ 회원 관리 (전체)
  USER_MANAGEMENT: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],

  // ✅ 회원 리스트
  USER_LIST: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],

  // ✅ 가입 승인
  USER_APPROVAL: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],

  // ✅ 공지사항 관리
  NOTICE_MANAGEMENT: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],

  // ✅ FAQ 관리
  QNA_MANAGEMENT: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN],

  // ✅ 관리자 IP 관리
  IP_MANAGEMENT: [UserRoleEnum.SUPER_ADMIN],
};

/**
 * ✅ 특정 메뉴에 대한 권한 확인
 */
export const hasMenuPermission = (
  menuId: keyof typeof MENU_PERMISSIONS,
  userRole?: UserRoleEnum
): boolean => {
  if (!userRole) return false;
  return MENU_PERMISSIONS[menuId].includes(userRole);
};

/**
 * ✅ 역할 레이블 조회 헬퍼
 */
export const getRoleLabel = (role: UserRoleEnum): string => {
  return ROLE_LABEL_MAP[role] ?? '알 수 없음';
};

/**
 * ✅ 관리자 여부 확인 (SUPER_ADMIN 또는 ADMIN)
 */
export const isAdminRole = (role?: UserRoleEnum): boolean => {
  if (!role) return false;
  return [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN].includes(role);
};

/**
 * ✅ 상담원 여부 확인
 */
export const isConsultantRole = (role?: UserRoleEnum): boolean => {
  if (!role) return false;
  return role === UserRoleEnum.CONSULTANT;
};
