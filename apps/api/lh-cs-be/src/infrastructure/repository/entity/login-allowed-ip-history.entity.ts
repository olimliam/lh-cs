import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Check,
} from 'typeorm';
import { LoginAllowedIpEntity } from './login-allowed-ip.entity';
import { UserEntity } from './user.entity';

export enum LoginAllowedIpHistoryAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

@Entity('login_allowed_ip_histories')
@Check(
  'chk_login_allowed_ip_history_action',
  "action IN ('CREATE','UPDATE','DELETE')",
)
@Index('idx_login_allowed_ip_history_ip_id', ['loginAllowedIpId'])
@Index('idx_login_allowed_ip_history_changed_by', ['changedBy'])
export class LoginAllowedIpHistoryEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'login_allowed_ip_history_id',
  })
  id: string;

  @Column({
    name: 'login_allowed_ip_id',
    type: 'bigint',
    comment: 'login_allowed_ip 테이블의 PK',
  })
  loginAllowedIpId: string;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 255,
    comment: '변경된 IP 주소 암호문',
  })
  ipAddress: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'IP 설명 스냅샷',
  })
  description?: string | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    comment: '허용 여부 스냅샷',
  })
  isActive: boolean;

  @Column({
    name: 'action',
    type: 'varchar',
    length: 16,
    enum: LoginAllowedIpHistoryAction,
    comment: '변경 유형',
  })
  action: LoginAllowedIpHistoryAction;

  @Column({
    name: 'changed_by',
    type: 'bigint',
    comment: '변경을 수행한 사용자 ID',
  })
  changedBy: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => LoginAllowedIpEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'login_allowed_ip_id' })
  loginAllowedIp: LoginAllowedIpEntity;

  @ManyToOne(() => UserEntity, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'changed_by' })
  changedByUser: UserEntity;
}
