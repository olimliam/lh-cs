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

export enum FacilityTypeEnum {
  CONSTRUCTION = 'CONSTRUCTION',
  MACHINE = 'MACHINE',
  ELECTRICITY = 'ELECTRICITY',
}

@Entity('facilities')
@Index(['title'])
@Index(['isActive'])
export class FacilityEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'facility_id' })
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '시설명',
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: '시설 설명',
  })
  description?: string;

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

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

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
  @OneToMany(() => TourFacilityEntity, (tourFacility) => tourFacility.facility)
  tourFacilities: TourFacilityEntity[];
}
