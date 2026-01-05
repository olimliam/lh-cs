import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshTokenEntity } from './refresh-token.entity';
import { UserSessionEntity } from './user-session.entity';
import { ConsultationEntity } from './consultation.entity';

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  WAIT = 'WAIT',
  DELETED = 'DELETED',
  PASSWORD_CHANGE_REQUIRED = 'PASSWORD_CHANGE_REQUIRED',
}

export enum UserRoleEnum {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  CONSULTANT = 'CONSULTANT', // 상담원 권한 추가
  USER = 'USER',
  VISITOR = 'VISITOR',
}

export enum UserApprovalStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum UserLockStatusEnum {
  UNLOCKED = 'UNLOCKED',
  LOCKED = 'LOCKED',
}

@Check(
  'chk_users_status_allowed_values',
  "status IN ('ACTIVE','INACTIVE','WAIT','DELETED','PASSWORD_CHANGE_REQUIRED')"
)
@Check(
  'chk_users_role_allowed_values',
  "role IN ('SUPER_ADMIN','ADMIN','CONSULTANT','USER','VISITOR')"
)
@Check(
  'chk_users_approval_status_allowed_values',
  "approval_status IN ('PENDING','APPROVED','REJECTED')"
)
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'user_id' })
  id: string;

  @Column({ type: 'varchar', length: 100, comment: '사용자 이름' })
  name: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 100,
    unique: true,
    comment: '로그인 아이디',
  })
  @Index('idx_users_username')
  username: string;

  @Column({
    name: 'phone_hash',
    type: 'char',
    length: 64,
    unique: true,
    comment: '전화번호 SHA-256 해시',
  })
  phoneHash: string;

  @Column({
    name: 'phone_encrypted',
    type: 'varbinary',
    length: 256,
    nullable: true,
    comment: '암호화된 전화번호',
  })
  phoneEncrypted?: Buffer;

  @Column({
    name: 'phone_iv',
    type: 'varbinary',
    length: 32,
    nullable: true,
    comment: '전화번호 암호화 IV',
  })
  phoneIv?: Buffer;

  @Column({
    name: 'phone_tag',
    type: 'varbinary',
    length: 32,
    nullable: true,
    comment: '전화번호 암호화 인증 태그',
  })
  phoneTag?: Buffer;

  @Column({
    name: 'phone_verified_at',
    type: 'datetime',
    nullable: true,
    comment: '전화번호 인증 완료 시각',
  })
  phoneVerifiedAt?: Date;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: '비밀번호 해시 (KCMVP PBKDF2-HMAC-SHA256)',
  })
  passwordHash: string;

  @Column({
    name: 'password_salt',
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: '비밀번호 salt (256bit hex)',
  })
  passwordSalt: string;

  @Column({
    name: 'kdf_algorithm',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'pbkdf2-hmac-sha256',
    comment: 'KDF 알고리즘 (서버 정책 고정)',
  })
  kdfAlgorithm: string;

  @Column({
    name: 'kdf_params',
    type: 'json',
    nullable: false,
    comment: 'KDF 파라미터 (algorithm, iterations, hashLength)',
  })
  kdfParams: {
    algorithm: string;
    iterations: number;
    hashLength: number;
  };

  @Column({
    name: 'pepper_version',
    type: 'int',
    nullable: false,
    default: 1,
    comment: 'Pepper 버전 (HSM 키 회전용)',
  })
  pepperVersion: number;

  @Column({
    name: 'hash_created_at',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    comment: '해시 생성 시간 (감사 추적용)',
  })
  hashCreatedAt: Date;

  @Column({
    name: 'profile_image_url',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '프로필 이미지 URL',
  })
  profileImageUrl?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '부서',
  })
  department?: string;

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

  @Column({
    name: 'signed_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
    comment: '가입 신청 시각',
  })
  signedAt?: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @Column({
    type: 'varchar',
    length: 16,
    default: UserRoleEnum.USER,
    enum: UserRoleEnum,
    comment: '사용자 역할 (SUPER_ADMIN, ADMIN, CONSULTANT, USER, VISITOR)',
  })
  role: UserRoleEnum;

  @Column({
    type: 'varchar',
    length: 16,
    default: UserStatusEnum.ACTIVE,
    enum: UserStatusEnum,
    comment:
      '사용자 상태 (ACTIVE, INACTIVE, WAIT, DELETED, PASSWORD_CHANGE_REQUIRED)',
  })
  status: UserStatusEnum;

  @Column({
    name: 'inactive_at',
    type: 'timestamp',
    nullable: true,
    comment: '계정 비활성화 시각',
  })
  inactiveAt?: Date | null;

  @Column({
    name: 'approval_status',
    type: 'varchar',
    length: 16,
    default: UserApprovalStatusEnum.PENDING,
    enum: UserApprovalStatusEnum,
    comment: '가입 승인 상태',
  })
  @Index('idx_users_approval_status')
  approvalStatus: UserApprovalStatusEnum;

  @Column({
    name: 'approval_completed_at',
    type: 'timestamp',
    nullable: true,
    comment: '가입 승인 완료 일시',
  })
  approvalCompletedAt?: Date | null;

  @Column({
    name: 'approval_completed_by_user_id',
    type: 'bigint',
    nullable: true,
    comment: '가입 승인 처리 관리자 ID',
  })
  approvalCompletedByUserId?: string | null;

  @Column({
    name: 'is_confirmed_terms',
    type: 'tinyint',
    width: 1,
    default: 0,
    comment: '필수 약관 동의 여부',
    transformer: {
      to: (value?: boolean) => (value ? 1 : 0),
      from: (value: number | null) => Boolean(value),
    },
  })
  isConfirmedTerms: boolean;

  @Column({
    name: 'lock_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '잠금 사유',
  })
  lockReason?: string;

  @Column({
    name: 'lock_at',
    type: 'datetime',
    nullable: true,
    comment: '잠금 시각',
  })
  lockAt?: Date;

  @Column({
    name: 'last_login_attempts',
    type: 'json',
    nullable: true,
    comment: '실패 내역 로그 (최대 5개)',
  })
  lastLoginAttempts?: any;

  @Column({
    name: 'last_login_at',
    type: 'timestamp',
    nullable: true,
    comment: '마지막 로그인 시간',
  })
  lastLoginAt?: Date;

  @Column({
    name: 'login_attempt_count',
    type: 'int',
    default: 0,
    comment: '로그인 시도 횟수',
  })
  loginAttemptCount: number;

  @Column({
    name: 'locked_until',
    type: 'timestamp',
    nullable: true,
    comment: '계정 잠금 해제 시간',
  })
  lockedUntil?: Date;

  @Column({
    name: 'lock_state',
    type: 'varchar',
    length: 16,
    default: UserLockStatusEnum.UNLOCKED,
    enum: UserLockStatusEnum,
    comment: '잠금 상태 (LOCKED, UNLOCKED)',
  })
  lockState: UserLockStatusEnum;

  // Methods
  isActive(): boolean {
    const isAllowedStatus =
      this.status === UserStatusEnum.ACTIVE ||
      this.status === UserStatusEnum.PASSWORD_CHANGE_REQUIRED;

    return (
      isAllowedStatus && (!this.lockedUntil || this.lockedUntil < new Date())
    );
  }

  @OneToMany(() => ConsultationEntity, (consultation) => consultation.user)
  consultations: ConsultationEntity[];

  @OneToMany(
    () => RefreshTokenEntity,
    (refreshToken: RefreshTokenEntity) => refreshToken.user
  )
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(
    () => UserSessionEntity,
    (session: UserSessionEntity) => session.user
  )
  sessions: UserSessionEntity[];
}
