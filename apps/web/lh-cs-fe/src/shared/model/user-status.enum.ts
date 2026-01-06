export enum UserStatusEnum {
  WAIT = 'WAIT', //대기
  ACTIVE = 'ACTIVE', //활성
  INACTIVE = 'INACTIVE', //중지
  DELETED = 'DELETED', //차단
  PASSWORD_CHANGE_REQUIRED = 'PASSWORD_CHANGE_REQUIRED', //비밀번호 변경 필요
}

export enum UserLoginLockStatusEnum {
  LOCKED = 'LOCKED', //차단
  UNLOCKED = 'UNLOCKED', //차단 해제
}
