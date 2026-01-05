import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user_registration_rejections')
export class UserRegistrationRejectionEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'user_registration_rejection_id',
  })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'department', type: 'varchar', length: 100, nullable: true })
  department?: string | null;

  @Column({ name: 'signed_at', type: 'timestamp' })
  signedAt: Date;

  @Column({ name: 'rejected_at', type: 'timestamp' })
  rejectedAt: Date;

  @Column({ name: 'rejected_by', type: 'bigint' })
  rejectedBy: string;

  @Column({ name: 'reason', type: 'varchar', length: 255, nullable: true })
  reason?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
