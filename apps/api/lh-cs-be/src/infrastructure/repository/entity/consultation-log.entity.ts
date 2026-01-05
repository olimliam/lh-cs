import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('consultation_log')
@Index('idx_consultation_log_created_at', ['createdAt'])
@Index('idx_consultation_log_consultation_id', ['consultationId'])
@Index('idx_consultation_log_user_id', ['counselorId'])
@Index('idx_consultation_log_action_type', ['actionType'])
@Index('idx_consultation_log_consultation_action', [
  'consultationId',
  'actionType',
])
@Index('idx_consultation_log_tour_id', ['tourId'])
@Index('idx_consultation_log_facility_id', ['facilityId'])
export class ConsultationLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'action_type', type: 'varchar', length: 50 })
  actionType: string;

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

  @Column({
    name: 'consultation_id',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  consultationId?: string | null;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  counselorId?: string | null;

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
