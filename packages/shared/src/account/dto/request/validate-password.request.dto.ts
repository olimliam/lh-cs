import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ValidatePasswordRequestDto {
  @ApiProperty({
    example: '1234',
    description: '사용자 비밀번호',
  })
  @IsString()
  password: string;

  constructor(dto: ValidatePasswordRequestDto) {
    this.password = dto.password;
  }
}
