import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordRequestDto {
  @ApiProperty({
    example: 10,
    description: '계정 정보 ID',
  })
  @IsString()
  accountId: number;

  @ApiProperty({
    example: '1234',
    description: '기존 비밀번호',
  })
  @IsString()
  password!: string;

  @ApiProperty({
    example: '4312',
    description: '변경할 비밀번호',
  })
  @IsString()
  newPassword: string;

  @ApiProperty({
    example: '4312',
    description: '다시 입력된 비밀번호',
  })
  @IsString()
  doubleCheckedNewPassword: string;

  constructor(dto: UpdatePasswordRequestDto) {
    this.accountId = dto.accountId;
    this.newPassword = dto.newPassword;
    this.doubleCheckedNewPassword = dto.doubleCheckedNewPassword;
  }
}
