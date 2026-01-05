import { ApiProperty } from '@nestjs/swagger';
import { PaginationResDto } from '@/common/dto/pagination.dto';

export class AdminLogItemDto {
  @ApiProperty({ description: '로그 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '액션 타입', example: 'change_role' })
  actionType: string;

  @ApiProperty({ description: '액션 값', nullable: true })
  actionValue?: string | null;

  @ApiProperty({ description: '상담사 ID', example: '42' })
  counselorId: string;

  @ApiProperty({ description: '디바이스 정보', nullable: true })
  device?: string | null;

  @ApiProperty({ description: 'IP 주소', nullable: true })
  ipAddress?: string | null;

  @ApiProperty({
    description: '이벤트 발생 일시',
    example: '2024-09-01T12:00:00.000Z',
  })
  createdAt: Date;
}

export class LoginLogItemDto {
  @ApiProperty({ description: '로그 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '액션 타입', example: 'success_login' })
  actionType: string;

  @ApiProperty({ description: '액션 값', nullable: true })
  actionValue?: string | null;

  @ApiProperty({ description: '상담사 ID', nullable: true })
  counselorId?: string | null;

  @ApiProperty({ description: '디바이스 정보', nullable: true })
  device?: string | null;

  @ApiProperty({ description: 'IP 주소', nullable: true })
  ipAddress?: string | null;

  @ApiProperty({ description: '이벤트 발생 일시' })
  createdAt: Date;
}

export class FreeTourLogItemDto {
  @ApiProperty({ description: '로그 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '세션 ID', nullable: true })
  sessionId?: string | null;

  @ApiProperty({ description: '투어 ID', nullable: true })
  tourId?: string | null;

  @ApiProperty({ description: '시설물 ID', nullable: true })
  facilityId?: string | null;

  @ApiProperty({ description: '액션 타입', example: 'move' })
  actionType: string;

  @ApiProperty({ description: '액션 값', nullable: true })
  actionValue?: string | null;

  @ApiProperty({ description: '디바이스 정보', nullable: true })
  device?: string | null;

  @ApiProperty({ description: 'IP 주소', nullable: true })
  ipAddress?: string | null;

  @ApiProperty({ description: '이벤트 발생 일시' })
  createdAt: Date;
}

export class ConsultationLogItemDto {
  @ApiProperty({ description: '로그 ID', example: '1' })
  id: string;

  @ApiProperty({ description: '상담실 ID', nullable: true })
  consultationId?: string | null;

  @ApiProperty({ description: '상담사 ID', nullable: true })
  counselorId?: string | null;

  @ApiProperty({ description: '투어 ID', nullable: true })
  tourId?: string | null;

  @ApiProperty({ description: '시설물 ID', nullable: true })
  facilityId?: string | null;

  @ApiProperty({ description: '액션 타입', example: 'counselor_enter' })
  actionType: string;

  @ApiProperty({ description: '액션 값', nullable: true })
  actionValue?: string | null;

  @ApiProperty({ description: '디바이스 정보', nullable: true })
  device?: string | null;

  @ApiProperty({ description: 'IP 주소', nullable: true })
  ipAddress?: string | null;

  @ApiProperty({ description: '이벤트 발생 일시' })
  createdAt: Date;
}

export class PaginatedAdminLogsResponse extends PaginationResDto<AdminLogItemDto> {
  @ApiProperty({ type: () => [AdminLogItemDto] })
  data: AdminLogItemDto[];
}

export class PaginatedLoginLogsResponse extends PaginationResDto<LoginLogItemDto> {
  @ApiProperty({ type: () => [LoginLogItemDto] })
  data: LoginLogItemDto[];
}

export class PaginatedFreeTourLogsResponse extends PaginationResDto<FreeTourLogItemDto> {
  @ApiProperty({ type: () => [FreeTourLogItemDto] })
  data: FreeTourLogItemDto[];
}

export class PaginatedConsultationLogsResponse extends PaginationResDto<ConsultationLogItemDto> {
  @ApiProperty({ type: () => [ConsultationLogItemDto] })
  data: ConsultationLogItemDto[];
}
