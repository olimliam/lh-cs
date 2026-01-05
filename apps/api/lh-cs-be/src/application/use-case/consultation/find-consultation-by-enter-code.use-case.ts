import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationResponse } from '@/presentation/dto/response';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class FindConsultationByEnterCodeUseCase {
  private readonly logger = new Logger(FindConsultationByEnterCodeUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository
  ) {}

  async execute(enterCode: string): Promise<ConsultationResponse> {
    this.logger.log(
      `findConsultationByEnterCode called with code: ${enterCode}`
    );

    const consultation =
      await this.consultationQueryRepository.findByEnterCode(enterCode);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_INVALID_CODE,
        HttpStatus.NOT_FOUND
      );
    }

    return ConsultationResponse.fromEntity(consultation);
  }
}
