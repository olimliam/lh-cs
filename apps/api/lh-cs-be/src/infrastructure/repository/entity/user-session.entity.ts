import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_sessions')
export class UserSessionEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
    name: 'user_session_id',
  })
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'ip_address',
    comment: '클라이언트 IP 암호문',
  })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent?: string;

  @CreateDateColumn({ name: 'login_at' })
  loginAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'logout_at' })
  logoutAt?: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // 세션이 활성 상태인지 확인
  isActive(): boolean {
    return !this.logoutAt;
  }
}
