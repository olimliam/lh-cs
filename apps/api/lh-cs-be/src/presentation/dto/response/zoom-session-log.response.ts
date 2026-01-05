import { ApiProperty } from '@nestjs/swagger';
import { ZoomSessionLogEntity } from '@/infrastructure/repository/entity/zoom-session-log.entity';

export class ZoomSessionLogResponseDto {
  @ApiProperty({ description: 'Zoom 세션 로그 ID' })
  id!: string;

  @ApiProperty({ description: '상담 ID' })
  consultationId!: string;

  @ApiProperty({ description: 'Zoom Video SDK sessionId' })
  zoomSessionId!: string;

  @ApiProperty({
    description: '세션 종료 처리 완료 시각',
    required: false,
    nullable: true,
  })
  closedAt?: Date | null;

  @ApiProperty({
    description: '마지막 종료 오류 메시지',
    required: false,
    nullable: true,
  })
  lastEndError?: string | null;

  @ApiProperty({ description: '생성 시각' })
  createdAt!: Date;

  @ApiProperty({ description: '업데이트 시각' })
  updatedAt!: Date;

  static from(
    entity: ZoomSessionLogEntity
  ): ZoomSessionLogResponseDto {
    const dto = new ZoomSessionLogResponseDto();
    dto.id = entity.id;
    dto.consultationId = entity.consultationId;
    dto.zoomSessionId = entity.zoomSessionId;
    dto.closedAt = entity.closedAt ?? null;
    dto.lastEndError = entity.lastEndError ?? null;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
