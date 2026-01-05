import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LoginActionType {
  TRY_LOGIN = 'try_login',
  SUCCESS_LOGIN = 'success_login',
  FAIL_LOGIN = 'fail_login',
}

@Entity('login_log')
export class LoginLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'action_type', type: 'varchar', length: 50 })
  actionType: string;

  @Column({
    name: 'action_value',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  actionValue?: string | null;

  @Column({
    name: 'created_at',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ name: 'user_id', type: 'bigint', nullable: true })
  counselorId?: string | null;

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
