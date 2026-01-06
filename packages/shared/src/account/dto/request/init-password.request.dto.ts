import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class InitPasswordRequestDto {
  @ApiProperty({
    example: 10,
    description: '사용자 계정 ID',
  })
  @IsNumber()
  accountId: number;

  constructor(dto: InitPasswordRequestDto) {
    this.accountId = dto.accountId;
  }
}
