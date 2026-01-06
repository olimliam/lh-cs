import { RoleEnum } from '../enum';

export class RoleModel {
  id!: number;
  roleName!: RoleEnum;

  constructor(props: RoleModel) {
    Object.assign(this, props);
  }
}
