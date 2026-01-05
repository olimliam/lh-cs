import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('login_allowed_ip')
@Index('idx_login_allowed_ip_ip_address', ['ipAddress'], { unique: true })
@Index('idx_login_allowed_ip_created_by', ['createdBy'])
export class LoginAllowedIpEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'login_allowed_ip_id',
  })
  id: string;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 255,
    comment: '허용된 클라이언트 IP 주소 암호문',
  })
  ipAddress: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'IP에 대한 설명 또는 메모',
  })
  description?: string | null;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    default: 1,
    comment: '허용 여부 플래그',
  })
  isActive: boolean;

  @Column({
    name: 'created_by',
    type: 'bigint',
    comment: 'IP를 등록한 관리자 username',
  })
  createdBy: string;

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

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  user: UserEntity;
}
