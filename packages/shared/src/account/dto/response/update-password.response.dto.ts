import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordResponseDto {
  @ApiProperty({
    example: '4312',
    description: '변경된 비밀번호',
  })
  @IsString()
  updatedPassword: string;

  constructor(dto: UpdatePasswordResponseDto) {
    this.updatedPassword = dto.updatedPassword;
  }
}
