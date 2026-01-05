import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ContentAttachmentEntity } from './content-attachment.entity';
import { ContentImageEntity } from './content-image.entity';

@Entity('notifications')
@Index(['createdAt'])
@Index('idx_notifications_created_by', ['createdBy'])
@Index('idx_notifications_updated_by', ['updatedBy'])
export class NotificationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'notification_id' })
  id: string;

  @Column({ type: 'varchar', length: 200, comment: '공지 제목' })
  title: string;

  @Column({ type: 'text', comment: '공지 내용' })
  content: string;

  @Column({
    name: 'file_url',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '첨부 파일 URL',
  })
  fileUrl?: string;

  @Column({
    name: 'is_public',
    type: 'boolean',
    default: true,
    comment: '공개 여부',
  })
  isPublic: boolean;

  @Column({
    name: 'created_by',
    type: 'bigint',
    comment: '작성자 ID',
  })
  createdBy: string;

  @Column({
    name: 'updated_by',
    type: 'bigint',
    comment: '최종 수정자 ID',
  })
  updatedBy: string;

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

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdByUser: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser: UserEntity;

  // Base entity에는 FK가 없으므로 쿼리 시 조인 매핑으로 채워짐
  contentAttachments?: ContentAttachmentEntity[];
  contentImages?: ContentImageEntity[];
}
