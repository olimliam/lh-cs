import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateProjectRequestDto {
  @ApiProperty({
    example: false,
    description: '스페이스 아이디',
  })
  @IsString()
  spaceId!: string;

  @ApiProperty({
    example: false,
    description: '예약 시작 일시',
  })
  @IsString()
  startDate!: string;

  @ApiProperty({
    example: false,
    description: '예약 종료 일시',
  })
  @IsString()
  endDate!: string;
}
