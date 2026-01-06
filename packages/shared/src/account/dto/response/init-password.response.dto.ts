import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class InitPasswordResponseDto {
  @ApiProperty({
    example: '4312',
    description: '초기화된 비밀번호',
  })
  @IsString()
  initPassword: string;

  constructor(dto: InitPasswordResponseDto) {
    this.initPassword = dto.initPassword;
  }
}
