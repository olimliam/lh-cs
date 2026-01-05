import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('zoom_session_logs')
@Index('idx_zoom_session_logs_consultation_id', ['consultationId'])
@Index('uq_zoom_session_logs_session_id', ['zoomSessionId'], {
  unique: true,
})
export class ZoomSessionLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'zoom_session_log_id' })
  id: string;

  @Column({
    name: 'consultation_id',
    type: 'bigint',
    comment: '상담실 ID (FK 미설정, 조회용)',
  })
  consultationId: string;

  @Column({
    name: 'zoom_session_id',
    type: 'varchar',
    length: 191,
    comment: 'Zoom Video SDK sessionId',
  })
  zoomSessionId: string;

  @Column({
    name: 'closed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Zoom 세션 종료 처리 완료 시각',
  })
  closedAt?: Date | null;

  @Column({
    name: 'last_end_error',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '종료 실패 시 마지막 오류 메시지',
  })
  lastEndError?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
