export class LoginResponseDto {
  username: string;
  roleName: string;
  accessToken: string;
  passwordChangeRequired: boolean;

  constructor(dto: LoginResponseDto) {
    this.username = dto.username;
    this.roleName = dto.roleName;
    this.accessToken = dto.accessToken;
    this.passwordChangeRequired = dto.passwordChangeRequired;
  }
}
