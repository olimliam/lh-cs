import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { TourEntity } from './tour.entity';
import { FacilityEntity, FacilityTypeEnum } from './facility.entity';
import { ConsultationEntity } from './consultation.entity';

@Entity('tour_facilities')
@Index(['tourId', 'facilityId', 'sceneId'], { unique: true })
@Index('idx_tour_default_start', ['tourId', 'isDefaultStart'])
@Index('idx_tour_active_order', ['tourId', 'isActive'])
export class TourFacilityEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'tour_facility_id' })
  id: string;

  @Column({ name: 'tour_id', type: 'bigint', comment: '투어 CDN ID' })
  tourId: string;

  @Column({ name: 'facility_id', type: 'bigint', comment: '시설 ID' })
  facilityId: string;

  @Column({ name: 'scene_id', type: 'bigint', comment: '투어 내 Scene ID' })
  sceneId: string;

  @Column({
    name: 'camera_pos_x',
    type: 'float',
    nullable: true,
    comment: '해당 투어에서의 카메라 포지션 X',
  })
  cameraPosX?: number;

  @Column({
    name: 'camera_pos_y',
    type: 'float',
    nullable: true,
    comment: '해당 투어에서의 카메라 포지션 Y',
  })
  cameraPosY?: number;

  @Column({
    name: 'camera_pos_z',
    type: 'float',
    nullable: true,
    comment: '해당 투어에서의 카메라 포지션 Z',
  })
  cameraPosZ?: number;

  @Column({
    name: 'is_default_start',
    type: 'boolean',
    default: false,
    comment: '기본 시작 위치 여부',
  })
  isDefaultStart: boolean;

  @Column({
    name: 'display_order',
    type: 'int',
    default: 0,
    comment: '표시 순서',
  })
  displayOrder: number;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '활성화 여부',
  })
  isActive: boolean;

  @Column({
    type: 'varchar',
    length: 16,
    enum: FacilityTypeEnum,
    comment: '시설 유형: CONSTRUCTION, MACHINE, ELECTRICITY',
  })
  type: FacilityTypeEnum;

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
  @ManyToOne(() => TourEntity, (tour) => tour.tourFacilities)
  @JoinColumn({ name: 'tour_id' })
  tour: TourEntity;

  @ManyToOne(() => FacilityEntity, (facility) => facility.tourFacilities)
  @JoinColumn({ name: 'facility_id' })
  facility: FacilityEntity;

  @OneToMany(
    () => ConsultationEntity,
    (consultation) => consultation.startTourFacility
  )
  consultations: ConsultationEntity[];
}
