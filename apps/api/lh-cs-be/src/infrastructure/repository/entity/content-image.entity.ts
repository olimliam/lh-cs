import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContentOwnerType } from '@/common/enum/content-owner-type.enum';

@Entity('content_images')
@Index('idx_content_images_content_id', ['contentId'])
@Index('idx_content_images_is_used', ['isUsed'])
@Index('ux_content_images_type_id_s3key', ['contentType', 'contentId', 's3Key'], {
  unique: true,
})
export class ContentImageEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'content_image_id',
  })
  id: string;

  @Column({
    name: 'content_id',
    type: 'bigint',
    nullable: true,
    comment: '콘텐츠 ID',
  })
  contentId?: string | null;

  @Column({
    name: 'content_type',
    type: 'varchar',
    length: 16,
    comment: '콘텐츠 도메인 타입',
  })
  contentType: ContentOwnerType;

  @Column({
    name: 's3_key',
    type: 'varchar',
    length: 500,
    comment: 'S3 오브젝트 키',
  })
  s3Key: string;

  @Column({
    name: 'url',
    type: 'varchar',
    length: 1000,
    comment: '공개 URL',
  })
  url: string;

  @Column({
    name: 'file_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '업로드 파일명',
  })
  fileName?: string | null;

  @Column({
    name: 'content_type_header',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '클라이언트 전송 MIME',
  })
  contentTypeHeader?: string | null;

  @Column({
    name: 'uploaded_by',
    type: 'bigint',
    comment: '업로더 ID',
  })
  uploadedBy: string;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
    comment: '콘텐츠 사용 여부',
  })
  isUsed: boolean;

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
}
