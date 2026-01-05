import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { TourFacilityEntity } from './tour-facility.entity';
import { ConsultationEntity } from './consultation.entity';

@Entity('tours')
export class TourEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'tour_id' })
  id: string;

  @Column({
    name: 'tour_cdn_id',
    type: 'varchar',
    length: 20,
    comment: '투어 접근 ID',
  })
  tourCdnId: string;

  @Column({
    name: 'square_meters',
    type: 'int',
    comment: '평형 제곱미터',
  })
  squareMeters: number;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '평형 정보 제목',
  })
  title: string;

  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 255,
    comment: '평형 이미지 URL',
  })
  imageUrl: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '투어 설명',
  })
  description?: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '활성화 여부',
  })
  isActive: boolean;

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

  // Relations
  @OneToMany(() => TourFacilityEntity, (tourFacility) => tourFacility.tour)
  tourFacilities: TourFacilityEntity[];

  @OneToMany(() => ConsultationEntity, (consultation) => consultation.tour)
  consultations: ConsultationEntity[];
}
