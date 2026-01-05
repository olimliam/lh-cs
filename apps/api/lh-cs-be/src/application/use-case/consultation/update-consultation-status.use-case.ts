import { Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '../../../infrastructure/repository/query/consultation-query.repository';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { ConsultationStatus } from '../../../infrastructure/repository/entity/consultation.entity';

@Injectable()
export class UpdateConsultationStatusUseCase {
  private readonly logger = new Logger(UpdateConsultationStatusUseCase.name);

  constructor(
    private readonly queryRepository: ConsultationQueryRepository,
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository
  ) {}

  async execute(
    consultationId: string,
    status: ConsultationStatus
  ): Promise<void> {
    try {
      const consultation = await this.queryRepository.findById(consultationId);
      if (!consultation) {
        this.logger.warn(
          `Consultation ${consultationId} not found for status update`
        );
        return;
      }

      await this.commandRepository.updateStatus(consultationId, status);
      await this.syncReadModel(consultationId, status);

      this.logger.log(
        `Updated consultation ${consultationId} status to ${status}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to update consultation ${consultationId} status:`,
        error
      );
    }
  }

  private async syncReadModel(
    consultationId: string,
    status: ConsultationStatus
  ): Promise<void> {
    try {
      await this.readRepository.updateReadModel(consultationId, {
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to update read model:', error);
    }
  }
}
