import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export enum FreeTourActionType {
  VISITOR_ENTER = 'VISITOR_ENTER',
  VISITOR_EXIT = 'VISITOR_EXIT',
  MOVE = 'MOVE',
  POP_OPEN = 'POP_OPEN',
  POP_CLOSE = 'POP_CLOSE',
}

@Entity('free_tour_log')
@Index('idx_free_tour_log_created_at', ['createdAt'])
@Index('idx_free_tour_log_session_id', ['sessionId'])
@Index('idx_free_tour_log_action_type', ['actionType'])
@Index('idx_free_tour_log_session_action', ['sessionId', 'actionType'])
@Index('idx_free_tour_log_tour_id', ['tourId'])
@Index('idx_free_tour_log_facility_id', ['facilityId'])
export class FreeTourLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    name: 'action_type',
    type: 'varchar',
    length: 16,
    enum: FreeTourActionType,
    comment: '이벤트 유형 (VISITOR_ENTER, VISITOR_EXIT, MOVE, POP_OPEN, POP_CLOSE)',
  })
  actionType: FreeTourActionType;

  @Column({
    name: 'action_value',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  actionValue?: string | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId?: string | null;

  @Column({ name: 'tour_id', type: 'varchar', length: 50, nullable: true })
  tourId?: string | null;

  @Column({ name: 'facility_id', type: 'varchar', length: 50, nullable: true })
  facilityId?: string | null;

  @Column({ type: 'text', nullable: true })
  device?: string | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '클라이언트 IP 암호문',
  })
  ipAddress?: string | null;
}
