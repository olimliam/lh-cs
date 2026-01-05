import { Injectable, Logger } from '@nestjs/common';
import { ReadConsultationRepository } from '@/infrastructure/repository/query/read-consultation.repository';
import { ReadConsultationEntity } from '@/infrastructure/repository/entity/read-consultation.entity';

@Injectable()
export class FindActiveConsultationByVisitorIdUseCase {
  private readonly logger = new Logger(
    FindActiveConsultationByVisitorIdUseCase.name
  );

  constructor(
    private readonly readConsultationRepository: ReadConsultationRepository
  ) {}

  async execute(
    visitorId: string
  ): Promise<ReadConsultationEntity | null> {
    this.logger.log(
      `findActiveConsultationByVisitorId called with: ${visitorId}`
    );
    try {
      return await this.readConsultationRepository.findActiveConsultationByVisitorId(
        visitorId
      );
    } catch (error) {
      this.logger.error(
        'Failed to find active consultation by visitor ID:',
        error
      );
      return null;
    }
  }
}
