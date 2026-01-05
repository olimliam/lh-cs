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
  Check,
} from 'typeorm';
import { TourFacilityEntity } from './tour-facility.entity';
import { TourEntity } from './tour.entity';
import { UserEntity } from './user.entity';
import { ConsultationHistoryEntity } from './consultation-history.entity';

export enum ConsultationStatus {
  READY = 'READY',
  CONSULTING = 'CONSULTING',
  END = 'END',
}

@Entity('consultations')
@Check(
  'chk_consultations_status_values',
  "status IN ('READY','CONSULTING','END')",
)
@Index(['userId', 'isActive'])
@Index(['status', 'isActive'])
@Index(['roomNumber'])
@Index(['enterCode'])
@Index(['consultationCode'], { unique: true })
export class ConsultationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'consultation_id' })
  id: string;

  @Column({ name: 'tour_id', type: 'bigint', comment: '투어 ID' })
  tourId: string;

  @Column({ name: 'user_id', type: 'bigint', comment: '상담원 ID' })
  userId: string;

  @Column({
    name: 'visitor_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '방문자 uuid',
  })
  visitorId?: string;

  @Column({
    name: 'start_tour_facility_id',
    type: 'bigint',
    comment: '상담 시작 투어 시설 ID (tour_facilities 테이블 참조)',
  })
  startTourFacilityId: string;

  @Column({
    name: 'consultation_code',
    type: 'varchar',
    length: 30,
    comment: '상담원 입력 상담 코드',
    unique: true,
  })
  consultationCode: string;

  @Column({
    name: 'room_number',
    type: 'varchar',
    length: 10,
    comment: '6자리 상담실 번호',
  })
  roomNumber: string;

  @Column({
    name: 'room_name',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: '상담실 이름',
  })
  roomName?: string;

  @Column({
    name: 'enter_code',
    type: 'varchar',
    length: 4,
    nullable: true,
    comment: '상담실 입장코드 (Random)',
  })
  enterCode?: string;

  @Column({
    name: 'capacity',
    type: 'int',
    default: 2,
    comment: '수용 인원',
  })
  capacity: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 16,
    default: ConsultationStatus.READY,
    enum: ConsultationStatus,
    comment: '상담실 상태: READY, CONSULTING, END',
  })
  status: ConsultationStatus;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    default: 1,
    comment: '활성화 상태: READY, CONSULTING 때는 true END가 되면 false로 변경',
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

  @Column({
    name: 'consulting_started_at',
    type: 'timestamp',
    nullable: true,
    comment: '상담 시작 시간 (CONSULTING 상태가 된 시점)',
  })
  consultingStartedAt?: Date;

  @Column({
    name: 'end_requested_at',
    type: 'timestamp',
    nullable: true,
    comment: '상담 종료 요청 시간 (END 상태로 변경된 시점)',
  })
  endRequestedAt?: Date;

  // Relations
  @ManyToOne(() => UserEntity, (user) => user.consultations)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => TourEntity, (tour) => tour.consultations)
  @JoinColumn({ name: 'tour_id' })
  tour: TourEntity;

  @ManyToOne(() => TourFacilityEntity, (facility) => facility.consultations)
  @JoinColumn({ name: 'start_tour_facility_id' })
  startTourFacility: TourFacilityEntity;

  @OneToMany(() => ConsultationHistoryEntity, (history) => history.consultation)
  histories: ConsultationHistoryEntity[];
}
