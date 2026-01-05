import { Entity, PrimaryColumn, Column, Index } from 'typeorm';
import { ConsultationStatus } from './consultation.entity';

@Entity('read_consultations')
@Index(['userId', 'isActive'])
@Index(['status', 'isActive'])
@Index(['roomNumber'])
@Index(['enterCode'])
export class ReadConsultationEntity {
  @PrimaryColumn({ type: 'bigint', name: 'consultation_id' })
  id: string;

  @Column({
    name: 'room_number',
    type: 'varchar',
    length: 10,
    comment: '상담실 번호',
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
    name: 'consultation_code',
    type: 'varchar',
    length: 30,
    comment: '상담 코드',
  })
  consultationCode: string;

  @Column({
    name: 'enter_code',
    type: 'varchar',
    length: 4,
    nullable: true,
    comment: '입장 코드',
  })
  enterCode?: string;

  @Column({
    type: 'varchar',
    length: 16,
    enum: ConsultationStatus,
    default: ConsultationStatus.READY,
    nullable: true,
    comment: '상담실 상태',
  })
  status: ConsultationStatus;

  @Column({
    name: 'is_active',
    type: 'tinyint',
    width: 1,
    comment: '활성화 상태',
  })
  isActive: boolean;

  @Column({
    name: 'user_id',
    type: 'bigint',
    comment: '상담원 사용자 ID',
  })
  userId: string;

  // 상담원 정보 (비정규화)
  @Column({
    name: 'consultant_name',
    type: 'varchar',
    length: 100,
    comment: '상담원 이름',
  })
  consultantName: string;

  @Column({
    name: 'consultant_username',
    type: 'varchar',
    length: 100,
    comment: '상담원 아이디',
  })
  consultantUsername: string;

  // 투어 정보 (비정규화)
  @Column({
    name: 'tour_id',
    type: 'bigint',
    comment: '투어 ID',
  })
  tourId: string;

  @Column({
    name: 'tour_cdn_id',
    type: 'varchar',
    length: 20,
    comment: '투어 CDN ID',
  })
  tourCdnId: string;

  @Column({
    name: 'tour_image_url',
    type: 'varchar',
    length: 255,
    comment: '투어 이미지 URL',
  })
  tourImageUrl: string;

  @Column({
    name: 'tour_title',
    type: 'varchar',
    length: 50,
    comment: '투어 제목',
  })
  tourTitle: string;

  @Column({
    name: 'tour_square_meters',
    type: 'int',
    comment: '투어 평형(제곱미터)',
  })
  tourSquareMeters: number;

  // 시설 정보 (비정규화) - tour_facilities를 통한 정보
  @Column({
    name: 'tour_facility_id',
    type: 'bigint',
    comment: '투어 시설 ID',
  })
  tourFacilityId: string;

  @Column({
    name: 'facility_id',
    type: 'bigint',
    comment: '시설 ID',
  })
  facilityId: string;

  @Column({
    name: 'facility_title',
    type: 'varchar',
    length: 50,
    comment: '시설 제목',
  })
  facilityTitle: string;

  @Column({
    name: 'facility_camera_pos_x',
    type: 'float',
    nullable: true,
    comment: '카메라 포지션 X',
  })
  facilityCameraPosX?: number;

  @Column({
    name: 'facility_camera_pos_y',
    type: 'float',
    nullable: true,
    comment: '카메라 포지션 Y',
  })
  facilityCameraPosY?: number;

  @Column({
    name: 'facility_camera_pos_z',
    type: 'float',
    nullable: true,
    comment: '카메라 포지션 Z',
  })
  facilityCameraPosZ?: number;

  @Column({
    name: 'facility_scene_id',
    type: 'bigint',
    comment: '시설 Scene ID',
  })
  facilitySceneId: string;

  @Column({
    name: 'start_facility_scene_id',
    type: 'bigint',
    comment: '상담 시작 시설 Scene ID',
  })
  startFacilitySceneId: string;

  // 방문자 정보
  @Column({
    name: 'visitor_id',
    type: 'varchar',
    length: 36,
    nullable: true,
    comment: '방문자 UUID',
  })
  visitorId?: string;

  // 시간 정보
  @Column({
    name: 'created_at',
    type: 'timestamp',
    comment: '생성 시간',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    comment: '수정 시간',
  })
  updatedAt: Date;

  @Column({
    name: 'consulting_started_at',
    type: 'timestamp',
    nullable: true,
    comment: '상담 시작 시간',
  })
  consultingStartedAt?: Date;

  @Column({
    name: 'end_requested_at',
    type: 'timestamp',
    nullable: true,
    comment: '상담 종료 요청 시간 (END 상태로 변경된 시점)',
  })
  endRequestedAt?: Date;
}
