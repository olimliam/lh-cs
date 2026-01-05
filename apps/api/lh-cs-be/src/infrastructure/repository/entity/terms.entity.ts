import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('terms')
export class TermsEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'terms_id' })
  id: string;

  @Column({ type: 'varchar', length: 255, comment: '약관 제목' })
  title: string;

  @Column({ type: 'varchar', length: 20, comment: '약관 버전' })
  version: string;

  @Column({
    name: 'is_required',
    type: 'tinyint',
    width: 1,
    default: 1,
    comment: '필수 동의 여부',
  })
  isRequired: boolean;

  @Column({
    name: 'published_at',
    type: 'datetime',
    nullable: true,
    comment: '공개 일시',
  })
  publishedAt?: Date;

  @Column({ type: 'text', comment: '약관 본문' })
  content: string;

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
