import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationVisitorInfoResponse } from '@/presentation/dto/response';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import { UpdateVisitorIdUseCase } from './update-visitor-id.use-case';
import { generateVisitorId } from '@/common/utils/uuid-generator';

@Injectable()
export class GetConsultationVisitorInfoUseCase {
  private readonly logger = new Logger(GetConsultationVisitorInfoUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository,
    private readonly updateVisitorIdUseCase: UpdateVisitorIdUseCase
  ) {}

  async execute(
    consultationId: string
  ): Promise<ConsultationVisitorInfoResponse> {
    this.logger.log(
      `getConsultationVisitorInfo called with: ${consultationId}`
    );

    try {
      const consultation = await this.consultationQueryRepository.findById(
        consultationId
      );

      if (!consultation) {
        throw new CustomException(
          ConsultationErrorCode.CONSULTATION_NOT_FOUND,
          HttpStatus.NOT_FOUND
        );
      }

      const visitorId = consultation.visitorId ?? generateVisitorId();
      consultation.visitorId = visitorId;

      await this.updateVisitorIdUseCase.execute(consultationId, visitorId);

      return ConsultationVisitorInfoResponse.fromEntity(consultation);
    } catch (error) {
      this.logger.error(
        'Failed to get consultation visitor info by consultation ID:',
        error
      );
      throw error;
    }
  }
}
