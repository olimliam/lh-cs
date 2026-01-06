export class LoginRequestDto {
  username!: string;
  password!: string;
  projectName!: string;
  allowedRoleName!: string;
  ip?: string;
  statusCode?: string;
}
