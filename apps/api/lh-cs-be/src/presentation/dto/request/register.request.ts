import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { PhoneVerificationErrorCode, PhoneVerificationErrorData } from '@/common/exception/error';

export class RegisterRequest {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  @MinLength(2, { message: '이름은 최소 2자 이상이어야 합니다.' })
  name: string;

  @ApiProperty({
    description: '로그인 아이디 (숫자 6~20자리)',
    example: '123456',
  })
  @IsString()
  @Length(6, 20, { message: '아이디는 최소 6자리, 최대 20자리 숫자여야 합니다.' })
  @Matches(/^\d{6,20}$/, {
    message: '아이디는 숫자 6~20자리만 사용할 수 있습니다.',
  })
  username: string;

  @ApiProperty({
    description: '전화번호 (숫자 10~11자리)',
    example: '01012345678',
  })
  @IsString()
  @Matches(/^\d{10,11}$/, {
    message: '전화번호는 숫자 10~11자리여야 합니다.',
  })
  phoneNumber: string;

  @ApiProperty({
    description: '전화번호 인증번호 (숫자 6자리)',
    example: '654321',
  })
  @IsString()
  @Matches(/^\d{6}$/, {
    message: PhoneVerificationErrorData[PhoneVerificationErrorCode.VERIFICATION_CODE_INVALID_FORMAT].message,
  })
  verificationCode: string;

  @ApiPropertyOptional({
    description: '사용자 권한',
    enum: UserRoleEnum,
    example: UserRoleEnum.CONSULTANT,
  })
  @IsEnum(UserRoleEnum)
  @IsOptional()
  role?: UserRoleEnum;

  @ApiPropertyOptional({
    description: '소속 부서',
    example: '공동주택관리지원실',
  })
  @IsString()
  @MaxLength(100, { message: '부서명은 최대 100자까지 입력 가능합니다.' })
  @IsOptional()
  department?: string;

  @ApiProperty({
    description: '비밀번호 (8자 이상, 대소문자, 숫자, 특수문자 포함)',
    example: 'SecurePass12#$',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message:
      '비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&#)를 포함해야 합니다.',
  })
  password: string;

  @ApiProperty({
    description: '비밀번호 확인',
    example: 'SecurePass12#$',
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    description: '필수 약관 동의 여부',
    example: true,
  })
  @IsBoolean()
  isConfirmedTerms: boolean;
}
