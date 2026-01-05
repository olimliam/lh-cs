import { UserRoleEnum } from '@/shared/model/user-role.enum';
import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';
import { RadioOption } from '../../../shared/ui/radio/radio-input';

/**
 * 회원 역할(유형) 라디오 옵션
 */
export const USER_ROLE_OPTIONS: ReadonlyArray<RadioOption<UserRoleEnum>> = [
  {
    value: UserRoleEnum.ADMIN,
    label: '관리자',
  },
  {
    value: UserRoleEnum.CONSULTANT,
    label: '상담사',
  },
] as const;

/**
 * 사용자 상태 라디오 옵션
 */
export const USER_STATUS_OPTIONS: ReadonlyArray<RadioOption<UserStatusEnum>> = [
  {
    value: UserStatusEnum.ACTIVE,
    label: '사용 중',
  },
  {
    value: UserStatusEnum.INACTIVE,
    label: '사용 중지',
  },
] as const;

/**
 * 잠금 상태 라디오 옵션 (예시)
 */
export const LOCK_STATUS_OPTIONS: ReadonlyArray<
  RadioOption<UserLoginLockStatusEnum>
> = [
  {
    value: UserLoginLockStatusEnum.UNLOCKED,
    label: '차단 해제',
  },
  {
    value: UserLoginLockStatusEnum.LOCKED,
    label: '차단',
  },
] as const;

/**
 * 게시글 (공지사항, 자주 묻는 질문)공개 설정 옵션
 */
export const PUBLIC_STATUS_OPTIONS: ReadonlyArray<RadioOption<boolean>> = [
  {
    value: true,
    label: '공개',
  },
  {
    value: false,
    label: '비공개',
  },
] as const;
