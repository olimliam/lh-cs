import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('phone_verifications')
@Index('idx_phone_verifications_phone_hash', ['phoneHash'])
@Index('idx_phone_verifications_expires_at', ['expiresAt'])
export class PhoneVerificationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'phone_verification_id' })
  id: string;

  @Column({ name: 'phone_hash', type: 'char', length: 64, comment: '전화번호 SHA-256 해시' })
  phoneHash: string;

  @Column({ name: 'phone_encrypted', type: 'varbinary', length: 256, comment: '암호화된 전화번호' })
  phoneEncrypted: Buffer;

  @Column({ name: 'phone_iv', type: 'varbinary', length: 32, comment: 'AES-GCM IV' })
  phoneIv: Buffer;

  @Column({ name: 'phone_tag', type: 'varbinary', length: 32, comment: 'AES-GCM 인증 태그' })
  phoneTag: Buffer;

  @Column({ name: 'verification_code', type: 'char', length: 6, comment: '인증번호 6자리' })
  verificationCode: string;

  @Column({ name: 'expires_at', type: 'datetime', comment: '만료 시각' })
  expiresAt: Date;

  @Column({ name: 'verified_at', type: 'datetime', nullable: true, comment: '인증 완료 시각' })
  verifiedAt?: Date;

  @Column({ name: 'attempt_count', type: 'int', default: 0, comment: '인증 시도 횟수' })
  attemptCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'verified', type: 'tinyint', width: 1, default: 0, comment: '인증 여부' })
  verified: boolean;
}
