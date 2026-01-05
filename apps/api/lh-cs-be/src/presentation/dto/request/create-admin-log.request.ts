import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export enum AdminLogActionTypeEnum {
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  CHANGE_NAME = 'CHANGE_NAME',
  CHANGE_DEPARTMENT = 'CHANGE_DEPARTMENT',
  CHANGE_PHOTO = 'CHANGE_PHOTO',
  CHANGE_ROLE = 'CHANGE_ROLE',
  CHANGE_PASSWORD = 'CHANGE_PASSWORD',
  CHANGE_STATUS = 'CHANGE_STATUS',
}

export class CreateAdminLogRequest {
  @ApiProperty({
    description: '이벤트 유형',
    enum: AdminLogActionTypeEnum,
    example: AdminLogActionTypeEnum.CREATE_ACCOUNT,
  })
  @IsEnum(AdminLogActionTypeEnum)
  @IsNotEmpty()
  actionType: AdminLogActionTypeEnum;

  @ApiProperty({
    description: '변경된 값 (비밀번호는 보안상 저장하지 않음)',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionValue?: string;

  @ApiProperty({
    description: '대상 사용자 ID',
    example: '123',
  })
  @IsString()
  @IsNotEmpty()
  counselorId: string;

  @ApiProperty({
    description: '기기 정보',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
