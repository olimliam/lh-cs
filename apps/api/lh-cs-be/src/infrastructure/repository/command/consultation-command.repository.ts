import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../entity/consultation.entity';
import { ConsultationHistoryEntity } from '../entity/consultation-history.entity';
import { ReadConsultationEntity } from '../entity/read-consultation.entity';
import { CreateConsultationCommand } from '../../../application/dto/command/create-consultation.command';

@Injectable()
export class ConsultationCommandRepository {
  constructor(
    @InjectRepository(ConsultationEntity)
    private readonly consultationRepo: Repository<ConsultationEntity>,
    @InjectRepository(ConsultationHistoryEntity)
    private readonly historyRepo: Repository<ConsultationHistoryEntity>,
    @InjectRepository(ReadConsultationEntity)
    private readonly readConsultationRepo: Repository<ReadConsultationEntity>,
    private readonly dataSource: DataSource
  ) {}

  /**
   * 상담실 생성 (트랜잭션 처리)
   */
  async create(
    createDto: CreateConsultationCommand
  ): Promise<ConsultationEntity> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 생성
      const consultation = manager.create(ConsultationEntity, {
        ...createDto,
        status: ConsultationStatus.READY,
        isActive: true,
      });
      const savedConsultation = await manager.save(consultation);

      // 2. 히스토리 생성
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: savedConsultation.id,
        status: ConsultationStatus.READY,
      });
      await manager.save(history);

      // 3. 읽기 모델 동기화 (향후 추가)
      // await this.syncReadModel(savedConsultation.id, manager);

      return savedConsultation;
    });
  }

  /**
   * 상담실 상태 업데이트
   */
  async updateStatus(id: string, status: ConsultationStatus): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 상태 업데이트
      await manager
        .createQueryBuilder()
        .update(ConsultationEntity)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute();

      // 2. 히스토리 추가
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: id,
        status,
      });
      await manager.save(history);
    });
  }

  /**
   * 상담실 상태와 상담 시작 시간 함께 업데이트
   */
  async updateStatusAndStartTime(
    id: string,
    status: ConsultationStatus,
    consultingStartedAt: Date
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 상태 및 시작 시간 업데이트
      await manager
        .createQueryBuilder()
        .update(ConsultationEntity)
        .set({
          status,
          consultingStartedAt,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute();

      // 2. 히스토리 추가
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: id,
        status,
      });
      await manager.save(history);
    });
  }

  /**
   * 방문자 할당
   */
  async assignVisitor(id: string, visitorId: string): Promise<void> {
    await this.consultationRepo
      .createQueryBuilder()
      .update(ConsultationEntity)
      .set({
        visitorId,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * 상담 종료 요청 (5분 지연 종료 시작)
   */
  async requestEndConsultation(
    id: string,
    endRequestedAt: Date
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 END 상태로 변경, endRequestedAt 설정
      await manager
        .createQueryBuilder()
        .update(ConsultationEntity)
        .set({
          status: ConsultationStatus.END,
          endRequestedAt,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute();

      // 2. 히스토리 추가
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: id,
        status: ConsultationStatus.END,
      });
      await manager.save(history);
    });
  }

  /**
   * 상담 완전 종료 (isActive = false)
   */
  async finalizeEndConsultation(em: EntityManager, id: string): Promise<void> {
    await em
      .createQueryBuilder()
      .update(ConsultationEntity)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * 상담 재시작 (END → READY, endRequestedAt 초기화)
   */
  async restartConsultation(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 재시작 - READY 상태로 변경하고 endRequestedAt 초기화
      await manager
        .createQueryBuilder()
        .update(ConsultationEntity)
        .set({
          status: ConsultationStatus.READY,
          endRequestedAt: undefined,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute();

      // 2. 히스토리 추가
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: id,
        status: ConsultationStatus.READY,
      });
      await manager.save(history);
    });
  }

  /**
   * 상담 종료 (기존 메서드 - 즉시 완전 종료)
   */
  async endConsultation(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1. 상담실 종료
      await manager
        .createQueryBuilder()
        .update(ConsultationEntity)
        .set({
          status: ConsultationStatus.END,
          isActive: false,
          updatedAt: new Date(),
        })
        .where('id = :id', { id })
        .execute();

      // 2. 히스토리 추가
      const history = manager.create(ConsultationHistoryEntity, {
        consultationId: id,
        status: ConsultationStatus.END,
      });
      await manager.save(history);
    });
  }

  /**
   * 상담실 소프트 삭제
   */
  async delete(id: string): Promise<void> {
    await this.consultationRepo
      .createQueryBuilder()
      .update(ConsultationEntity)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where('id = :id', { id })
      .execute();
  }

  /**
   * visitorId 업데이트 (Write Model)
   */
  async updateVisitorId(
    consultationId: string,
    visitorId: string
  ): Promise<void> {
    await this.consultationRepo
      .createQueryBuilder()
      .update(ConsultationEntity)
      .set({
        visitorId,
        updatedAt: new Date(),
      })
      .where('id = :id', { id: consultationId })
      .execute();
  }

  /**
   * 읽기 모델 동기화 (향후 구현)
   */
  private async syncReadModel(
    consultationId: string,
    manager: any
  ): Promise<void> {
    // TODO: 읽기 모델 테이블에 데이터 동기화
    // 복잡한 JOIN 쿼리로 read_consultations 테이블 업데이트
  }
}
