import {
  UserLoginLockStatusEnum,
  UserStatusEnum,
} from '@/shared/model/user-status.enum';

export interface StatusData {
  locked: {
    isEdit: boolean;
    value: UserLoginLockStatusEnum;
  };
  userStatus: {
    isEdit: boolean;
    value: UserStatusEnum;
  };
}

// export enum PublicStatusEnum {
//   SHOW = 'SHOW',
//   HIDE = 'HIDE',
// }
