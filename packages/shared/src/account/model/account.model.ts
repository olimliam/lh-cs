export class AccountModel {
  accountId: number;
  username: string;
  projectName: string;
  roleName: string;
  accountRoleId: number;
  constructor(dto: AccountModel) {
    this.accountId = dto.accountId;
    this.username = dto.username;
    this.projectName = dto.projectName;
    this.roleName = dto.roleName;
    this.accountRoleId = dto.accountRoleId;
  }
}
