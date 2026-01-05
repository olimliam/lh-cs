import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { StatisticsService } from '../../service/statistics.service';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';
import { ZoomVideoSdkService } from '@/application/zoom/zoom-video-sdk.service';

@Injectable()
export class FinalizeEndConsultationUseCase {
  private readonly logger = new Logger(FinalizeEndConsultationUseCase.name);

  constructor(
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository,
    private readonly statisticsService: StatisticsService,
    private readonly broadcastManager: BroadcastManagerService,
    private readonly zoomVideoSdkService: ZoomVideoSdkService
  ) {}

  async execute(em: EntityManager, id: string, userId?: string): Promise<void> {
    this.logger.log('finalizeEndConsultation called with id:', id);

    try {
      await this.logFinalization(id, userId);

      await this.commandRepository.finalizeEndConsultation(em, id);

      await this.updateReadModel(id, em);
      await this.closeZoomSessions(id);

      await this.notifyConsultationEnded(id);

      this.logger.log('Consultation finalized successfully', { id });
    } catch (error) {
      this.logger.error('Failed to finalize consultation:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_END_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담 완전 종료에 실패했습니다.'
      );
    }
  }

  private async logFinalization(
    consultationId: string,
    userId?: string
  ): Promise<void> {
    try {
      await this.statisticsService.createConsultationLog({
        actionType: ConsultationLogActionTypeEnum.CONSULTATION_DESTROY,
        actionValue: null,
        consultationId,
        counselorId: userId || 'system',
        device: null,
        ipAddress: null,
      });
    } catch (error) {
      this.logger.error('Failed to log consultation destruction:', error);
    }
  }

  private async updateReadModel(
    consultationId: string,
    em?: EntityManager
  ): Promise<void> {
    try {
      await this.readRepository.updateReadModel(
        consultationId,
        {
          isActive: false,
          updatedAt: new Date(),
        },
        em
      );
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }

  private async notifyConsultationEnded(consultationId: string): Promise<void> {
    try {
      this.broadcastManager.broadcastConsultationEnded(consultationId);
      this.logger.log(
        `Successfully notified WebSocket clients about consultation ${consultationId} ended`
      );
    } catch (error) {
      this.logger.error(
        `Error notifying WebSocket clients about consultation ${consultationId}:`,
        error
      );
    }
  }

  private async closeZoomSessions(consultationId: string): Promise<void> {
    try {
      const { closedSessionIds } =
        await this.zoomVideoSdkService.closeSessionsByConsultation(
          consultationId
        );

      if (closedSessionIds.length > 0) {
        this.logger.log(
          `Closed Zoom sessions for consultation ${consultationId}: [${closedSessionIds.join(', ')}]`
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to close Zoom sessions for consultation ${consultationId}:`,
        error instanceof Error ? error.stack : undefined
      );
    }
  }
}
