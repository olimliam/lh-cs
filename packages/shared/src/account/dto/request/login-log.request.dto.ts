import { LoginLogStatusEnum } from '@/account/enum';

export class LoginLogRequestDto {
  accountId?: number; // 서버에서 토큰에서 계정 정보를 추출하여 설정함.
  projectName!: string;
  ip?: string;
  statusCode?: LoginLogStatusEnum;
}
