import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, EntityManager } from 'typeorm';
import { ReadConsultationEntity } from '../entity/read-consultation.entity';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../entity/consultation.entity';
import { TourEntity } from '../entity/tour.entity';
import { FacilityEntity } from '../entity/facility.entity';
import { TourFacilityEntity } from '../entity/tour-facility.entity';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class ReadConsultationRepository {
  constructor(
    @InjectRepository(ReadConsultationEntity)
    private readonly readConsultationRepo: Repository<ReadConsultationEntity>,
    private readonly dataSource: DataSource
  ) {}

  /**
   * 상담실 생성 시 읽기 모델 생성
   */
  async createReadModel(consultation: ConsultationEntity): Promise<void> {
    // 관련 데이터들을 JOIN하여 조회
    const readData = await this.dataSource
      .createQueryBuilder()
      .select([
        'c.id as id',
        'c.roomNumber as roomNumber',
        'c.roomName as roomName',
        'c.consultationCode as consultationCode',
        'c.enterCode as enterCode',
        'c.status as status',
        'c.isActive as isActive',
        'c.userId as userId',
        'c.visitorId as visitorId',
        'c.consultingStartedAt as consultingStartedAt',
        'c.createdAt as createdAt',
        'c.updatedAt as updatedAt',
        'u.name as consultantName',
        'u.username as consultantUsername',
        't.id as tourId',
        't.tourCdnId as tourCdnId',
        't.imageUrl as tourImageUrl',
        't.title as tourTitle',
        't.squareMeters as tourSquareMeters',
        'tf.id as tourFacilityId',
        'tf.sceneId as facilitySceneId',
        'tf.sceneId as startFacilitySceneId',
        'tf.cameraPosX as facilityCameraPosX',
        'tf.cameraPosY as facilityCameraPosY',
        'tf.cameraPosZ as facilityCameraPosZ',
        'f.id as facilityId',
        'f.title as facilityTitle',
      ])
      .from(ConsultationEntity, 'c')
      .leftJoin(UserEntity, 'u', 'u.id = c.user_id')
      .leftJoin(TourEntity, 't', 't.id = c.tour_id')
      .leftJoin(TourFacilityEntity, 'tf', 'tf.id = c.start_tour_facility_id')
      .leftJoin(FacilityEntity, 'f', 'f.id = tf.facility_id')
      .where('c.id = :id', { id: consultation.id })
      .getRawOne();

    if (readData) {
      const readConsultation = this.readConsultationRepo.create({
        id: readData.id,
        roomNumber: readData.roomNumber,
        roomName: readData.roomName,
        consultationCode: readData.consultationCode,
        enterCode: readData.enterCode,
        status: readData.status,
        isActive: readData.isActive,
        userId: readData.userId,
        consultantName: readData.consultantName,
        consultantUsername: readData.consultantUsername,
        tourId: readData.tourId,
        tourCdnId: readData.tourCdnId,
        tourImageUrl: readData.tourImageUrl,
        tourTitle: readData.tourTitle,
        tourSquareMeters: readData.tourSquareMeters,
        tourFacilityId: readData.tourFacilityId,
        facilityId: readData.facilityId,
        facilityTitle: readData.facilityTitle,
        facilitySceneId: readData.facilitySceneId,
        startFacilitySceneId: readData.startFacilitySceneId,
        facilityCameraPosX: readData.facilityCameraPosX,
        facilityCameraPosY: readData.facilityCameraPosY,
        facilityCameraPosZ: readData.facilityCameraPosZ,
        visitorId: readData.visitorId,
        consultingStartedAt: readData.consultingStartedAt,
        createdAt: readData.createdAt,
        updatedAt: readData.updatedAt,
      });

      await this.readConsultationRepo.save(readConsultation);
    }
  }

  /**
   * 상담실 업데이트 시 읽기 모델 동기화
   */
  async updateReadModel(
    consultationId: string,
    updateData: Partial<ConsultationEntity>,
    em?: EntityManager
  ): Promise<void> {
    const updateFields: any = {};

    const repository = em
      ? em.getRepository(ReadConsultationEntity)
      : this.readConsultationRepo;

    if (updateData.roomName !== undefined)
      updateFields.roomName = updateData.roomName;
    if (updateData.status !== undefined)
      updateFields.status = updateData.status;
    if (updateData.isActive !== undefined)
      updateFields.isActive = updateData.isActive;
    if (updateData.userId !== undefined)
      updateFields.userId = updateData.userId;
    if (updateData.visitorId !== undefined)
      updateFields.visitorId = updateData.visitorId;
    if (updateData.consultingStartedAt !== undefined)
      updateFields.consultingStartedAt = updateData.consultingStartedAt;
    if (updateData.updatedAt !== undefined)
      updateFields.updatedAt = updateData.updatedAt;
    if (updateData.endRequestedAt !== undefined)
      updateFields.endRequestedAt = updateData.endRequestedAt;

    if (Object.keys(updateFields).length > 0) {
      await repository
        .createQueryBuilder()
        .update(ReadConsultationEntity)
        .set(updateFields)
        .where('id = :id', { id: consultationId })
        .execute();
    }
  }

  /**
   * 읽기 모델 삭제
   */
  async deleteReadModel(consultationId: string): Promise<void> {
    await this.readConsultationRepo.delete({ id: consultationId });
  }

  /**
   * 최적화된 상담실 목록 조회
   */
  async findActiveConsultations(
    userId: string
  ): Promise<ReadConsultationEntity[]> {
    return await this.readConsultationRepo.find({
      where: {
        userId,
        isActive: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * 입장 코드로 상담실 조회
   */
  async findByEnterCode(
    enterCode: string
  ): Promise<ReadConsultationEntity | null> {
    return await this.readConsultationRepo.findOne({
      where: {
        enterCode,
        isActive: true,
      },
    });
  }

  /**
   * visitorId로 활성 상담 조회 (Read Model)
   */
  async findActiveConsultationByVisitorId(
    visitorId: string
  ): Promise<ReadConsultationEntity | null> {
    return await this.readConsultationRepo.findOne({
      where: {
        visitorId,
        isActive: true,
        status: In([ConsultationStatus.READY, ConsultationStatus.CONSULTING]),
      },
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  /**
   * visitorId 업데이트 (Read Model)
   */
  async updateVisitorId(
    consultationId: string,
    visitorId: string
  ): Promise<void> {
    await this.readConsultationRepo
      .createQueryBuilder()
      .update(ReadConsultationEntity)
      .set({
        visitorId,
        updatedAt: new Date(),
      })
      .where('id = :id', { id: consultationId })
      .execute();
  }

  /**
   * 상담실 검색
   */
  async searchConsultations(
    userId?: string,
    status?: string,
    isActive?: boolean,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: ReadConsultationEntity[]; total: number }> {
    const queryBuilder = this.readConsultationRepo.createQueryBuilder('rc');

    if (userId) {
      queryBuilder.andWhere('rc.userId = :userId', {
        userId,
      });
    }

    if (status) {
      queryBuilder.andWhere('rc.status = :status', { status });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('rc.isActive = :isActive', { isActive });
    }

    const [items, total] = await queryBuilder
      .orderBy('rc.createdAt', 'DESC')
      .limit(limit)
      .offset(offset)
      .getManyAndCount();

    return { items, total };
  }
}
