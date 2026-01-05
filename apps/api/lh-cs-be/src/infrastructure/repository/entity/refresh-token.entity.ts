import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint', name: 'refresh_token_id' })
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255, name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'revoked_at' })
  revokedAt?: Date;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  // 토큰이 유효한지 확인
  isValid(): boolean {
    return !this.revokedAt && this.expiresAt > new Date();
  }
}
