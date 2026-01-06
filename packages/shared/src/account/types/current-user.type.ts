import { RoleEnum } from '../enum';

export type CurrentUserType = {
  accountId: number;
  accountRoleId?: number;
  projectName?: string;
  roleName?: RoleEnum;
};
