import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ConsultationStatsQuery {
  @ApiProperty({
    description: '총 활성 상담실 수',
    example: 5,
  })
  totalActive: number;

  @ApiProperty({
    description: '대기 중인 상담실 수',
    example: 3,
  })
  waitingRooms: number;

  @ApiProperty({
    description: '상담 중인 상담실 수',
    example: 2,
  })
  consultingRooms: number;

  @ApiProperty({
    description: '방문자가 있는 상담실 수',
    example: 2,
  })
  withVisitorRooms: number;

  @ApiProperty({
    description: '오늘 생성된 상담실 수',
    example: 10,
  })
  todayCreated: number;

  @ApiProperty({
    description: '이번 달 완료된 상담 수',
    example: 50,
  })
  monthlyCompleted: number;
}
