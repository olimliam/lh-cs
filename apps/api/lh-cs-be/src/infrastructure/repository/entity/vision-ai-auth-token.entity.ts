import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VisionAiTokenType {
  EPT = 'EPT',
}

@Entity('vision_ai_tokens')
export class VisionAiAuthTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  @Index('uk_vision_ai_tokens_jti', { unique: true })
  jti: string;

  @Column({ type: 'enum', enum: VisionAiTokenType, default: VisionAiTokenType.EPT })
  tokenType: VisionAiTokenType;

  @Column({ type: 'varchar', length: 64 })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  origin: string;

  @Column({ type: 'varchar', length: 255 })
  audience: string;

  @Column({ type: 'varchar', length: 255 })
  scope: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  redeemedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
