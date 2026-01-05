import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { StatisticsService } from '../../service/statistics.service';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import {
  ConsultationEntity,
  ConsultationStatus,
} from '../../../infrastructure/repository/entity/consultation.entity';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';

@Injectable()
export class RequestEndConsultationUseCase {
  private readonly logger = new Logger(RequestEndConsultationUseCase.name);

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository,
    private readonly statisticsService: StatisticsService,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log('requestEndConsultation called with id:', id);

    const consultation = await this.queryRepository.findById(id);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    if (consultation.status === ConsultationStatus.END) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_ALREADY_ENDED,
        HttpStatus.BAD_REQUEST,
        '이미 종료중인 상담실입니다.'
      );
    }

    try {
      const now = new Date();

      await this.logCounselorExit(consultation);

      await this.commandRepository.requestEndConsultation(id, now);

      await this.updateReadModel(id, now);

      this.logger.log(
        'Consultation end requested successfully (5min delay started)',
        { id }
      );

      await this.notifyConsultationEnding(id);
    } catch (error) {
      this.logger.error('Failed to request end consultation:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_END_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담 종료 요청에 실패했습니다.'
      );
    }
  }

  private async logCounselorExit(
    consultation: ConsultationEntity
  ): Promise<void> {
    try {
      await this.statisticsService.createConsultationLog({
        actionType: ConsultationLogActionTypeEnum.COUNSELOR_EXIT,
        actionValue: null,
        consultationId: consultation.id,
        counselorId: consultation.userId,
        tourId: consultation.tourId,
        facilityId: consultation.startTourFacilityId,
        device: null,
        ipAddress: null,
      });
    } catch (error) {
      this.logger.error(
        'Failed to log counselor exit (requestEndConsultation):',
        error
      );
    }
  }

  private async updateReadModel(id: string, now: Date): Promise<void> {
    try {
      await this.readRepository.updateReadModel(id, {
        status: ConsultationStatus.END,
        endRequestedAt: now,
        updatedAt: now,
      });
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }

  private async notifyConsultationEnding(consultationId: string) {
    try {
      this.broadcastManager.broadcastConsultationEnding(consultationId);
      this.logger.log(
        `Successfully notified WebSocket clients about consultation ${consultationId} ending`
      );
    } catch (error) {
      this.logger.error(
        `Error notifying WebSocket clients about consultation ${consultationId}:`,
        error
      );
    }
  }
}
