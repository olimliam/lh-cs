import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In, EntityManager } from 'typeorm';
import {
  ConsultationEntity,
  ReadConsultationEntity,
  ConsultationStatus,
} from '../entity';
import { SearchConsultationQuery } from '@/application/dto/query/search-consultation.query';
import { ConsultationStatsQuery } from '@/application/dto/query/consultation-stats.query';

@Injectable()
export class ConsultationQueryRepository {
  constructor(
    @InjectRepository(ConsultationEntity)
    private readonly consultationRepo: Repository<ConsultationEntity>,
    @InjectRepository(ReadConsultationEntity)
    private readonly readModelRepo: Repository<ReadConsultationEntity>
  ) {}

  /**
   * ID로 상담실 조회
   */
  async findById(id: string): Promise<ConsultationEntity | null> {
    return await this.consultationRepo.findOne({
      where: { id },
      relations: [
        'user',
        'tour',
        'startTourFacility',
        'startTourFacility.facility',
      ],
    });
  }

  /**
   * ID로 상담실 + 투어 + 투어 시설 일괄 조회 (정렬 포함)
   */
  async findFullById(id: string): Promise<ConsultationEntity | null> {
    return await this.consultationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.tour', 't')
      .leftJoinAndSelect('c.startTourFacility', 'stf')
      .leftJoinAndSelect('stf.facility', 'stfFacility')
      .leftJoinAndSelect(
        't.tourFacilities',
        'tf',
        'tf.isActive = :isActive',
        { isActive: true }
      )
      .leftJoinAndSelect('tf.facility', 'f')
      .where('c.id = :id', { id })
      .orderBy('tf.displayOrder', 'ASC')
      .addOrderBy('tf.id', 'ASC')
      .getOne();
  }

  /**
   * 읽기 모델에서 ID로 조회 (성능 최적화)
   */
  async findByIdFromReadModel(
    id: string
  ): Promise<ReadConsultationEntity | null> {
    return await this.readModelRepo.findOne({
      where: { id },
    });
  }

  /**
   * 사용자별 활성 상담실 조회
   */
  async findActiveByUserId(userId: string): Promise<ConsultationEntity[]> {
    return await this.consultationRepo.find({
      where: {
        userId,
        isActive: true,
      },
      relations: [
        'user',
        'tour',
        'startTourFacility',
        'startTourFacility.facility',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 읽기 모델에서 사용자별 활성 상담실 조회 (성능 최적화)
   */
  async findActiveByUserIdFromReadModel(
    userId: string
  ): Promise<ReadConsultationEntity[]> {
    return await this.readModelRepo.find({
      where: {
        userId,
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 읽기 모델에서 모든 활성 상담실 조회 (관리자용)
   */
  async findAllActiveFromReadModel(): Promise<ReadConsultationEntity[]> {
    return await this.readModelRepo.find({
      where: {
        isActive: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 상담실 번호로 조회
   */
  async findByRoomNumber(
    roomNumber: string
  ): Promise<ConsultationEntity | null> {
    return await this.consultationRepo.findOne({
      where: { roomNumber },
      relations: [
        'user',
        'tour',
        'startTourFacility',
        'startTourFacility.facility',
      ],
    });
  }

  /**
   * 입장 코드로 조회
   */
  async findByEnterCode(enterCode: string): Promise<ConsultationEntity | null> {
    const result = await this.consultationRepo.findOne({
      where: {
        enterCode,
        status: In([ConsultationStatus.READY, ConsultationStatus.CONSULTING]),
        isActive: true,
      },
      relations: [
        'user',
        'tour',
        'startTourFacility',
        'startTourFacility.facility',
      ],
    });
    return result;
  }

  /**
   * 상담 코드로 조회
   */
  async findByConsultationCode(
    consultationCode: string
  ): Promise<ConsultationEntity | null> {
    return await this.consultationRepo.findOne({
      where: { consultationCode },
      select: ['id', 'consultationCode'],
    });
  }

  /**
   * 상담실 검색 (기본 - JOIN 방식)
   */
  async search(
    searchDto: SearchConsultationQuery
  ): Promise<ConsultationEntity[]> {
    const queryBuilder = this.consultationRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.tour', 't')
      .leftJoinAndSelect('c.startTourFacility', 'stf')
      .leftJoinAndSelect('stf.facility', 'f')
      .where('1 = 1');

    if (searchDto.userId) {
      queryBuilder.andWhere('c.userId = :userId', {
        userId: searchDto.userId,
      });
    }

    this.applySearchFilters(queryBuilder, searchDto);

    if (searchDto.limit) {
      queryBuilder.limit(searchDto.limit);
    }

    if (searchDto.offset) {
      queryBuilder.offset(searchDto.offset);
    }

    return await queryBuilder.orderBy('c.createdAt', 'DESC').getMany();
  }

  /**
   * 읽기 모델에서 검색 (성능 최적화)
   */
  async searchFromReadModel(
    searchDto: SearchConsultationQuery
  ): Promise<ReadConsultationEntity[]> {
    const queryBuilder = this.readModelRepo
      .createQueryBuilder('crm')
      .where('1 = 1');

    if (searchDto.userId) {
      queryBuilder.andWhere('crm.userId = :userId', {
        userId: searchDto.userId,
      });
    }

    this.applyReadModelSearchFilters(queryBuilder, searchDto);

    if (searchDto.limit) {
      queryBuilder.limit(searchDto.limit);
    }

    if (searchDto.offset) {
      queryBuilder.offset(searchDto.offset);
    }

    return await queryBuilder.orderBy('crm.createdAt', 'DESC').getMany();
  }

  /**
   * 상담실 통계 조회
   */
  async getConsultationStats(userId?: string): Promise<ConsultationStatsQuery> {
    const statsQuery = this.consultationRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'totalActive')
      .addSelect(
        `COUNT(CASE WHEN c.status = :readyStatus THEN 1 END)`,
        'waitingRooms'
      )
      .addSelect(
        `COUNT(CASE WHEN c.status = :consultingStatus THEN 1 END)`,
        'consultingRooms'
      )
      .addSelect(
        `COUNT(CASE WHEN c.visitorId IS NOT NULL THEN 1 END)`,
        'withVisitorRooms'
      )
      .where('1 = 1')
      .andWhere('c.isActive = :isActive', { isActive: true })
      .setParameters({
        readyStatus: ConsultationStatus.READY,
        consultingStatus: ConsultationStatus.CONSULTING,
      });

    if (userId) {
      statsQuery.andWhere('c.userId = :userId', { userId });
    }

    const stats = await statsQuery.getRawOne();

    const todayQuery = this.consultationRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'todayCreated')
      .where('DATE(c.createdAt) = CURDATE()');

    if (userId) {
      todayQuery.andWhere('c.userId = :userId', { userId });
    }

    const todayStats = await todayQuery.getRawOne();

    const monthlyQuery = this.consultationRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'monthlyCompleted')
      .where('c.status = :endStatus', { endStatus: ConsultationStatus.END })
      .andWhere('YEAR(c.updatedAt) = YEAR(CURDATE())')
      .andWhere('MONTH(c.updatedAt) = MONTH(CURDATE())');

    if (userId) {
      monthlyQuery.andWhere('c.userId = :userId', { userId });
    }

    const monthlyStats = await monthlyQuery.getRawOne();

    return {
      totalActive: parseInt(stats.totalActive) || 0,
      waitingRooms: parseInt(stats.waitingRooms) || 0,
      consultingRooms: parseInt(stats.consultingRooms) || 0,
      withVisitorRooms: parseInt(stats.withVisitorRooms) || 0,
      todayCreated: parseInt(todayStats.todayCreated) || 0,
      monthlyCompleted: parseInt(monthlyStats.monthlyCompleted) || 0,
    };
  }

  /**
   * 검색 필터 적용 (기본 테이블용)
   */
  private applySearchFilters(
    queryBuilder: SelectQueryBuilder<ConsultationEntity>,
    searchDto: SearchConsultationQuery
  ): void {
    if (searchDto.roomNumber) {
      queryBuilder.andWhere('c.roomNumber LIKE :roomNumber', {
        roomNumber: `%${searchDto.roomNumber}%`,
      });
    }

    if (searchDto.status) {
      queryBuilder.andWhere('c.status = :status', {
        status: searchDto.status,
      });
    }

    if (searchDto.tourId) {
      queryBuilder.andWhere('c.tourId = :tourId', {
        tourId: searchDto.tourId,
      });
    }

    if (searchDto.startDate && searchDto.endDate) {
      queryBuilder.andWhere('c.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(searchDto.startDate),
        endDate: new Date(searchDto.endDate),
      });
    }
  }

  /**
   * 검색 필터 적용 (읽기 모델용)
   */
  private applyReadModelSearchFilters(
    queryBuilder: SelectQueryBuilder<ReadConsultationEntity>,
    searchDto: SearchConsultationQuery
  ): void {
    if (searchDto.roomNumber) {
      queryBuilder.andWhere('crm.roomNumber LIKE :roomNumber', {
        roomNumber: `%${searchDto.roomNumber}%`,
      });
    }

    if (searchDto.status) {
      queryBuilder.andWhere('crm.status = :status', {
        status: searchDto.status,
      });
    }

    if (searchDto.tourId) {
      queryBuilder.andWhere('crm.tourId = :tourId', {
        tourId: searchDto.tourId,
      });
    }

    if (searchDto.startDate && searchDto.endDate) {
      queryBuilder.andWhere('crm.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(searchDto.startDate),
        endDate: new Date(searchDto.endDate),
      });
    }
  }

  /**
   * 5분이 지난 종료 요청된 상담실 ID 조회 (배치 작업용)
   */
  async findEndRequestedConsultations(
    em: EntityManager,
    fiveMinutesAgo: Date
  ): Promise<string[]> {
    const repository = em
      ? em.getRepository(ConsultationEntity)
      : this.consultationRepo;

    const consultations = await repository
      .createQueryBuilder('c')
      .select(['c.id'])
      .where('c.status = :status', { status: ConsultationStatus.END })
      .andWhere('c.isActive = :isActive', { isActive: true })
      .andWhere('c.endRequestedAt IS NOT NULL')
      .andWhere('c.endRequestedAt <= :fiveMinutesAgo', { fiveMinutesAgo })
      .getMany();

    return consultations.map((consultation) => consultation.id);
  }

}
