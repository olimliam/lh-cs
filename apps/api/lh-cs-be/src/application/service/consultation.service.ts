import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntityManager, QueryRunner } from 'typeorm';
import { ConsultationQueryRepository } from '../../infrastructure/repository/query/consultation-query.repository';
import {
  CreateConsultationCommand,
  StartConsultationCommand,
} from '../dto/command';
import { ConsultationStatsQuery, SearchConsultationQuery } from '../dto/query';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../infrastructure/repository/entity/consultation.entity';
import { ReadConsultationEntity } from '@/infrastructure/repository/entity/read-consultation.entity';
import {
  ConsultationResponse,
  ConsultationFullResponse,
  ConsultationVisitorInfoResponse,
} from '@/presentation/dto/response';
import { ResponsePayload } from '@/common/dto/response-payload.dto';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity, UserRoleEnum } from '@/infrastructure/repository/entity';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

import {
  CreateConsultationUseCase,
  StartConsultationUseCase,
  RequestEndConsultationUseCase,
  FinalizeEndConsultationUseCase,
  RestartConsultationUseCase,
  UpdateConsultationStatusByVisitorConnectionUseCase,
  UpdateConsultationStatusUseCase,
  UpdateConsultationStatusByConnectionUseCase,
  UpdateVisitorIdUseCase,
  GetAllActiveConsultationsUseCase,
  GetConsultationByIdUseCase,
  FindConsultationByEnterCodeUseCase,
  SearchConsultationsUseCase,
  GetDashboardStatsUseCase,
  FindConsultationByEnterCodeForVisitorUseCase,
  FindActiveConsultationByVisitorIdUseCase,
  GetConsultationVisitorInfoUseCase,
} from '../use-case/consultation';

@Injectable()
export class ConsultationService {
  constructor(
    private readonly logger: Logger,
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly createConsultationUseCase: CreateConsultationUseCase,
    private readonly startConsultationUseCase: StartConsultationUseCase,
    private readonly requestEndConsultationUseCase: RequestEndConsultationUseCase,
    private readonly finalizeEndConsultationUseCase: FinalizeEndConsultationUseCase,
    private readonly restartConsultationUseCase: RestartConsultationUseCase,
    private readonly updateStatusByVisitorConnectionUseCase: UpdateConsultationStatusByVisitorConnectionUseCase,
    private readonly updateConsultationStatusUseCase: UpdateConsultationStatusUseCase,
    private readonly updateStatusByConnectionUseCase: UpdateConsultationStatusByConnectionUseCase,
    private readonly updateVisitorIdUseCase: UpdateVisitorIdUseCase,
    private readonly getAllActiveConsultationsUseCase: GetAllActiveConsultationsUseCase,
    private readonly getConsultationByIdUseCase: GetConsultationByIdUseCase,
    private readonly findConsultationByEnterCodeUseCase: FindConsultationByEnterCodeUseCase,
    private readonly searchConsultationsUseCase: SearchConsultationsUseCase,
    private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase,
    private readonly findConsultationByEnterCodeForVisitorUseCase: FindConsultationByEnterCodeForVisitorUseCase,
    private readonly findActiveConsultationByVisitorIdUseCase: FindActiveConsultationByVisitorIdUseCase,
    private readonly getConsultationVisitorInfoUseCase: GetConsultationVisitorInfoUseCase
  ) {}

  // ========== Command 작업 (쓰기) ==========

  /**
   * 상담실 생성
   */
  async createConsultation(
    createDto: CreateConsultationCommand
  ): Promise<ConsultationResponse> {
    return this.createConsultationUseCase.execute(createDto);
  }

  /**
   * 상담 시작
   */
  async startConsultation(
    id: string,
    startDto: StartConsultationCommand,
    user?: UserEntity
  ): Promise<void> {
    if (user) {
      await this.ensureConsultationOwnership(id, user);
    }
    return this.startConsultationUseCase.execute(id, startDto);
  }

  /**
   * 상담 종료 요청 (5분 지연 종료 시작)
   */
  async requestEndConsultation(id: string, user?: UserEntity): Promise<void> {
    if (user) {
      await this.ensureConsultationOwnership(id, user);
    }
    return this.requestEndConsultationUseCase.execute(id);
  }

  /**
   * 상담 완전 종료 (배치 작업에서 호출)
   */
  async finalizeEndConsultation(
    em: EntityManager,
    id: string,
    userId?: string
  ): Promise<void> {
    return this.finalizeEndConsultationUseCase.execute(em, id, userId);
  }

  /**
   * 상담 재시작 (END 상태에서 READY로 복원)
   */
  async restartConsultation(id: string, user?: UserEntity): Promise<void> {
    if (user) {
      await this.ensureConsultationOwnership(id, user);
    }
    return this.restartConsultationUseCase.execute(id);
  }

  /**
   * 5분이 지난 종료 요청된 상담실 조회 (배치 작업용)
   */
  async findConsultationsToFinalize(em: EntityManager): Promise<string[]> {
    this.logger.log('findConsultationsToFinalize called');

    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5분 전
      console.log('Five minutes ago:', fiveMinutesAgo);
      return await this.queryRepository.findEndRequestedConsultations(
        em,
        fiveMinutesAgo
      );
    } catch (error) {
      this.logger.error('Failed to find consultations to finalize:', error);
      return [];
    }
  }

  /**
   * 방문자가 입장하면 상태를 READY/CONSULTING으로 변경
   * 방문자가 통상 나중에 접속하므로 CONSULTING으로 변경로직이 포함되어야 한다.
   * 방문자 접속시
   * @param consultationId
   * @param isAdminConnected
   * @param isVisitorConnected
   * @returns
   */
  async updateConsultationStatusByVisitorConnection(
    consultationId: string,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ) {
    return this.updateStatusByVisitorConnectionUseCase.execute(
      consultationId,
      isAdminConnected,
      isVisitorConnected
    );
  }

  async updateConsultationStatus(
    consultationId: string,
    status: ConsultationStatus
  ) {
    return this.updateConsultationStatusUseCase.execute(consultationId, status);
  }

  /**
   * 연결 상태에 따른 상담실 상태 업데이트 (WebSocket 이벤트용)
   */
  async updateConsultationStatusByConnection(
    consultationId: string,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): Promise<ResponsePayload<ConsultationStatus | null>> {
    return this.updateStatusByConnectionUseCase.execute(
      consultationId,
      isAdminConnected,
      isVisitorConnected
    );
  }

  // ========== Query 작업 (읽기) ==========

  /**
   * 사용자별 활성 상담실 목록 조회
   */
  async getAllActiveConsultations(
    userId: string
  ): Promise<ConsultationResponse[]> {
    return this.getAllActiveConsultationsUseCase.execute(userId);
  }

  /**
   * 상담실 상세 조회
   */
  async getConsultationById(
    id: string,
    user?: UserEntity
  ): Promise<ConsultationResponse> {
    if (!user) {
      return this.getConsultationByIdUseCase.execute(id);
    }

    const consultation = await this.getConsultationEntityOrThrow(id);
    this.assertOwnership(user, consultation.userId);
    return ConsultationResponse.fromEntity(consultation);
  }

  /**
   * 상담실 + 투어 + 투어 시설 상세 조회
   */
  async getConsultationFullById(
    id: string,
    user?: UserEntity
  ): Promise<ConsultationFullResponse> {
    const consultation = await this.queryRepository.findFullById(id);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `상담실 ID ${id}를 찾을 수 없습니다.`
      );
    }

    if (user) {
      this.assertOwnership(user, consultation.userId);
    }

    return ConsultationFullResponse.fromEntity(consultation);
  }

  /**
   * 입장 코드로 상담실 찾기
   */
  async findConsultationByEnterCode(
    enterCode: string
  ): Promise<ConsultationResponse> {
    return this.findConsultationByEnterCodeUseCase.execute(enterCode);
  }

  /**
   * 상담실 검색
   */
  async searchConsultations(
    searchDto: SearchConsultationQuery,
    user: UserEntity
  ): Promise<ConsultationResponse[]> {
    const payload: SearchConsultationQuery = {
      ...searchDto,
    };

    if (this.isPrivileged(user)) {
      payload.userId = payload.userId ?? undefined;
    } else {
      if (payload.userId && payload.userId !== user.id) {
        this.throwAccessDenied();
      }
      payload.userId = user.id;
    }

    return this.searchConsultationsUseCase.execute(payload);
  }

  /**
   * 대시보드 통계 조회
   */
  async getConsultationStats(
    currentUser: UserEntity
  ): Promise<ConsultationStatsQuery> {
    const effectiveUserId = this.isPrivileged(currentUser)
      ? undefined
      : currentUser.id;
    return this.getDashboardStatsUseCase.execute(effectiveUserId);
  }

  /**
   * enterCode로 상담실 찾기 (Visitor 인증용)
   */
  async findByEnterCode(enterCode: string) {
    return this.findConsultationByEnterCodeForVisitorUseCase.execute(enterCode);
  }

  /**
   * visitorId로 활성 상담 조회
   */
  async findActiveConsultationByVisitorId(visitorId: string) {
    return this.findActiveConsultationByVisitorIdUseCase.execute(visitorId);
  }

  /**
   * visitorId 업데이트 (CQRS: Command + Read 모델 각각 업데이트)
   */
  async updateVisitorId(consultationId: string, visitorId: string) {
    return this.updateVisitorIdUseCase.execute(consultationId, visitorId);
  }

  /**
   * 상담 ID로 방문자/투어 정보를 조회
   * - visitorId가 없으면 생성 후 관련 평형/시설 정보를 포함하여 반환
   */
  async getConsultationVisitorInfo(
    consultationId: string
  ): Promise<ConsultationVisitorInfoResponse> {
    return this.getConsultationVisitorInfoUseCase.execute(consultationId);
  }

  /**
   * 자정 전체 정리: read_consultations → consultations 순서로 물리 삭제
   */
  async purgeAllConsultations(qr: QueryRunner): Promise<{
    readDeleted: number;
    consultationsDeleted: number;
  }> {
    const manager = qr.manager;
    await qr.startTransaction();
    try {
      const readDeleted = await manager
        .createQueryBuilder()
        .delete()
        .from(ReadConsultationEntity)
        .execute();

      const consultationsDeleted = await manager
        .createQueryBuilder()
        .delete()
        .from(ConsultationEntity)
        .execute();

      await qr.commitTransaction();
      return {
        readDeleted: readDeleted.affected ?? 0,
        consultationsDeleted: consultationsDeleted.affected ?? 0,
      };
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    }
  }

  /**
   * 1시간 초과 READY 상담실 물리 삭제 (읽기 모델 포함)
   */
  async deleteStaleReadyConsultations(
    qr: QueryRunner,
    olderThan: Date
  ): Promise<{
    deletedIds: string[];
    readDeleted: number;
    consultationsDeleted: number;
  }> {
    const manager = qr.manager;
    await qr.startTransaction();
    try {
      const staleIds = await manager
        .createQueryBuilder(ConsultationEntity, 'c')
        .select('c.id', 'id')
        .where('c.status = :status', { status: ConsultationStatus.READY })
        .andWhere('c.isActive = :isActive', { isActive: true })
        .andWhere('c.updatedAt <= :olderThan', { olderThan })
        .getRawMany<{ id: string }>();

      const ids = staleIds.map((row) => row.id);
      if (ids.length === 0) {
        await qr.commitTransaction();
        return { deletedIds: [], readDeleted: 0, consultationsDeleted: 0 };
      }

      const readDeleted = await manager
        .createQueryBuilder()
        .delete()
        .from(ReadConsultationEntity)
        .where('id IN (:...ids)', { ids })
        .execute();

      const consultationsDeleted = await manager
        .createQueryBuilder()
        .delete()
        .from(ConsultationEntity)
        .where('id IN (:...ids)', { ids })
        .execute();

      await qr.commitTransaction();
      return {
        deletedIds: ids,
        readDeleted: readDeleted.affected ?? 0,
        consultationsDeleted: consultationsDeleted.affected ?? 0,
      };
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    }
  }

  generateUUID = (): string => {
    return uuidv4();
  };

  private async ensureConsultationOwnership(
    consultationId: string,
    user: UserEntity
  ): Promise<ConsultationEntity> {
    const consultation =
      await this.getConsultationEntityOrThrow(consultationId);
    this.assertOwnership(user, consultation.userId);
    return consultation;
  }

  private async getConsultationEntityOrThrow(
    consultationId: string
  ): Promise<ConsultationEntity> {
    const consultation = await this.queryRepository.findById(consultationId);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `상담실 ID ${consultationId}를 찾을 수 없습니다.`
      );
    }
    return consultation;
  }

  private assertOwnership(user: UserEntity, ownerId: string) {
    if (this.isPrivileged(user)) {
      return;
    }

    if (`${ownerId}` !== `${user.id}`) {
      this.throwAccessDenied();
    }
  }

  private isPrivileged(user?: Pick<UserEntity, 'role'>): boolean {
    if (!user || !user.role) {
      return true;
    }

    return (
      user.role === UserRoleEnum.ADMIN || user.role === UserRoleEnum.SUPER_ADMIN
    );
  }

  private throwAccessDenied(): never {
    throw new CustomException(
      ConsultationErrorCode.CONSULTATION_ACCESS_DENIED,
      HttpStatus.FORBIDDEN,
      '상담실에 접근할 권한이 없습니다.'
    );
  }
}
