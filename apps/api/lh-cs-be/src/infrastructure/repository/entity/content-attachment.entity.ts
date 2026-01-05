import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';

@Entity('content_attachments')
@Index('idx_content_attachments_owner', ['ownerType', 'ownerId'])
@Index('ux_content_attachments_owner_index', ['ownerType', 'ownerId', 'attachmentIndex'], {
  unique: true,
})
@Index('ux_content_attachments_key', ['fileKey'], { unique: true })
export class ContentAttachmentEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'content_attachment_id',
  })
  id: string;

  @Column({
    name: 'owner_type',
    type: 'varchar',
    length: 16,
    comment: '첨부 소유 도메인',
  })
  ownerType: ContentOwnerType;

  @Column({
    name: 'owner_id',
    type: 'bigint',
    comment: '첨부 소유 ID',
  })
  ownerId: string;

  @Column({
    name: 'attachment_index',
    type: 'int',
    unsigned: true,
    nullable: true,
    comment: '첨부 순서',
  })
  attachmentIndex?: number | null;

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 255,
    comment: '요청된 파일명',
  })
  fileName: string;

  @Column({
    name: 'file_url',
    type: 'varchar',
    length: 500,
    comment: '파일 접근 URL',
  })
  fileUrl: string;

  @Column({
    name: 'file_key',
    type: 'varchar',
    length: 500,
    unique: true,
    comment: 'S3 파일 키',
  })
  fileKey: string;

  @Column({
    name: 'mime_type',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'MIME 타입',
  })
  mimeType?: string | null;

  @Column({
    name: 'file_size',
    type: 'bigint',
    nullable: true,
    comment: '파일 크기(바이트)',
  })
  fileSize?: string | null;

  @Column({
    name: 'created_by',
    type: 'bigint',
    comment: '업로더 ID',
  })
  createdBy: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
