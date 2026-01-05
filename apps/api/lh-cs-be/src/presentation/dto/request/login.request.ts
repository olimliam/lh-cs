import { IsString, Matches, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
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
    description: '비밀번호',
    example: 'SecurePass12#$',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  password: string;
}
