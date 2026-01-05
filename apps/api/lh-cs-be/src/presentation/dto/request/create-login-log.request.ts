import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';

export enum LoginLogActionTypeEnum {
  TRY_LOGIN = 'try_login',
  SUCCESS_LOGIN = 'success_login',
  FAIL_LOGIN = 'fail_login',
}

export enum LoginFailReasonEnum {
  FAIL_PASSWORD = 'Fail Password',
  FAIL_USERNAME = 'Fail Username',
  BLOCK_ACCOUNT = 'Block Account',
  NOT_ALLOW_IP = 'Not Allow IP',
  SERVER_ERROR = '500',
}

export class CreateLoginLogRequest {
  @ApiProperty({
    description: '이벤트 유형',
    enum: LoginLogActionTypeEnum,
    example: LoginLogActionTypeEnum.TRY_LOGIN,
  })
  @IsEnum(LoginLogActionTypeEnum)
  @IsNotEmpty()
  actionType: LoginLogActionTypeEnum;

  @ApiProperty({
    description: '실패 사유 또는 세부 값 (실패시에만 사용)',
    enum: LoginFailReasonEnum,
    example: LoginFailReasonEnum.FAIL_PASSWORD,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionValue?: string;

  @ApiProperty({
    description: '대상 사용자 ID (실패시 null 가능)',
    example: '123',
    required: false,
  })
  @IsOptional()
  @IsString()
  counselorId?: string;

  @ApiProperty({
    description: '기기 정보',
    example: 'iPhone 14',
    required: false,
  })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({
    description: 'IP 주소 (저장 시 암호화 처리)',
    example: '192.168.1.100',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;
}
