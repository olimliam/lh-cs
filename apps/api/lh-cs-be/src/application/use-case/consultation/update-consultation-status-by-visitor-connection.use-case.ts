import { Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';

@Injectable()
export class UpdateConsultationStatusByVisitorConnectionUseCase {
  private readonly logger = new Logger(
    UpdateConsultationStatusByVisitorConnectionUseCase.name
  );

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository
  ) {}

  async execute(
    consultationId: string,
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): Promise<void> {
    try {
      const consultation = await this.queryRepository.findById(consultationId);
      if (!consultation) {
        this.logger.warn(
          `Consultation ${consultationId} not found for status update`
        );
        return;
      }

      const newStatus = this.determineStatus(
        isAdminConnected,
        isVisitorConnected
      );
      const isStartingConsultation =
        consultation.status !== ConsultationStatus.CONSULTING &&
        newStatus === ConsultationStatus.CONSULTING;
      const consultingStartedAt = isStartingConsultation
        ? new Date()
        : undefined;

      await this.persistStatus(
        consultationId,
        newStatus,
        consultingStartedAt
      );
      await this.syncReadModel(
        consultationId,
        newStatus,
        consultingStartedAt
      );
    } catch (error) {
      this.logger.error(
        'Failed to update consultation status by visitor connection:',
        error
      );
    }
  }

  private determineStatus(
    isAdminConnected: boolean,
    isVisitorConnected: boolean
  ): ConsultationStatus {
    if (isAdminConnected && isVisitorConnected) {
      return ConsultationStatus.CONSULTING;
    }

    if (isAdminConnected || isVisitorConnected) {
      return ConsultationStatus.READY;
    }

    return ConsultationStatus.READY;
  }

  private async persistStatus(
    consultationId: string,
    status: ConsultationStatus,
    consultingStartedAt?: Date
  ) {
    if (consultingStartedAt) {
      this.logger.log(
        `Updating consultation ${consultationId} with start time: ${consultingStartedAt.toISOString()}`
      );
      await this.commandRepository.updateStatusAndStartTime(
        consultationId,
        status,
        consultingStartedAt
      );
      return;
    }

    await this.commandRepository.updateStatus(consultationId, status);
  }

  private async syncReadModel(
    consultationId: string,
    status: ConsultationStatus,
    consultingStartedAt?: Date
  ) {
    try {
      await this.readRepository.updateReadModel(consultationId, {
        status,
        updatedAt: new Date(),
        consultingStartedAt,
      });
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }
}
