import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AdminActionType {
  CREATE_ACCOUNT = 'create_account',
  CHANGE_NAME = 'change_name',
  CHANGE_DEPARTMENT = 'change_department',
  CHANGE_PHOTO = 'change_photo',
  CHANGE_AUTHORITY = 'change_authority',
  CHANGE_PASSWORD = 'change_password',
  CHANGE_STATUS = 'change_status',
}

@Entity('admin_log')
export class AdminLogEntity {
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

  @Column({ name: 'user_id', type: 'bigint' })
  counselorId: string;

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
