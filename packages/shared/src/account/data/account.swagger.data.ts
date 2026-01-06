import { LoginResponseDto } from '../dto';

export class AccountSwaggerData {
  static loginResponse: LoginResponseDto = {
    username: 'tester',
    roleName: 'admin',
    accessToken: 'access-token',
    passwordChangeRequired: false,
  };
}
