import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ConsultationStatus, ConsultationEntity } from './consultation.entity';

@Entity('consultation_histories')
@Index(['consultationId', 'createdAt'])
@Index(['status'])
export class ConsultationHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'consultation_history_id' })
  id: string;

  @Column({
    name: 'consultation_id',
    type: 'bigint',
    comment: '상담실 ID',
  })
  consultationId: string;

  @Column({
    type: 'varchar',
    length: 16,
    enum: ConsultationStatus,
    comment: '상담실 상태: READY, CONSULTING, END',
  })
  status: ConsultationStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => ConsultationEntity, (consultation) => consultation.histories)
  @JoinColumn({ name: 'consultation_id' })
  consultation: ConsultationEntity;
}
