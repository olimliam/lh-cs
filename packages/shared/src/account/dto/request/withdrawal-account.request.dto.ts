import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber } from 'class-validator';

export class WithdrawalAccountRequestDto {
  @ApiProperty({
    example: [1, 2, 3, 4],
    description: '사용자 비밀번호 배열',
  })
  @IsArray()
  @IsNumber({}, { each: true }) // 각 배열 요소가 숫자인지 확인
  accountIds: number[];

  constructor(dto: WithdrawalAccountRequestDto) {
    this.accountIds = dto.accountIds;
  }
}
