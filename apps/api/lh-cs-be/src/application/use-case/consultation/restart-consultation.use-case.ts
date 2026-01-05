import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { BroadcastManagerService } from '../../service/broadcast-manager.service';
import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class RestartConsultationUseCase {
  private readonly logger = new Logger(RestartConsultationUseCase.name);

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository,
    private readonly broadcastManager: BroadcastManagerService
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.log('restartConsultation called with id:', id);

    const consultation = await this.queryRepository.findById(id);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    }

    try {
      await this.commandRepository.restartConsultation(id);

      await this.updateReadModel(id);

      this.logger.log('Consultation restarted successfully', { id });

      await this.notifyConsultationRestarted(id);
    } catch (error) {
      this.logger.error('Failed to restart consultation:', error);
      if (error instanceof CustomException) {
        throw error;
      }
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_START_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담 재시작에 실패했습니다.'
      );
    }
  }

  private async updateReadModel(consultationId: string) {
    try {
      await this.readRepository.updateReadModel(consultationId, {
        status: ConsultationStatus.READY,
        endRequestedAt: undefined,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }

  private async notifyConsultationRestarted(
    consultationId: string
  ): Promise<void> {
    try {
      this.broadcastManager.broadcastConsultationRestarted(consultationId);
      this.logger.log(
        `Successfully notified WebSocket clients about consultation ${consultationId} restarted`
      );
    } catch (error) {
      this.logger.error(
        `Error notifying WebSocket clients about consultation ${consultationId}:`,
        error
      );
    }
  }
}
