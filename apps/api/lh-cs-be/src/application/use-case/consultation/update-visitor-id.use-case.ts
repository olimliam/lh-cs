import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationCommandRepository } from '../../../infrastructure/repository/command/consultation-command.repository';
import { ReadConsultationRepository } from '../../../infrastructure/repository/query/read-consultation.repository';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class UpdateVisitorIdUseCase {
  private readonly logger = new Logger(UpdateVisitorIdUseCase.name);

  constructor(
    private readonly commandRepository: ConsultationCommandRepository,
    private readonly readRepository: ReadConsultationRepository
  ) {}

  async execute(consultationId: string, visitorId: string): Promise<void> {
    this.logger.log(
      `updateVisitorId called with consultationId: ${consultationId}, visitorId: ${visitorId}`
    );

    try {
      await this.commandRepository.updateVisitorId(consultationId, visitorId);
      await this.readRepository.updateVisitorId(consultationId, visitorId);
      this.logger.log(
        'Successfully updated visitor ID in both Write and Read models'
      );
    } catch (error) {
      this.logger.error('Failed to update visitor ID:', error);
      throw new CustomException(
        ConsultationErrorCode.VISITOR_ASSIGN_FAILED,
        HttpStatus.BAD_REQUEST,
        '방문자 정보 업데이트에 실패했습니다.'
      );
    }
  }
}
