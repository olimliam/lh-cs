import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationResponse } from '@/presentation/dto/response';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class GetConsultationByIdUseCase {
  private readonly logger = new Logger(GetConsultationByIdUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository
  ) {}

  async execute(id: string): Promise<ConsultationResponse> {
    this.logger.log(`getConsultationById called with id: ${id}`);

    const consultation = await this.consultationQueryRepository.findById(id);
    if (!consultation) {
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        `상담실 ID ${id}를 찾을 수 없습니다.`
      );
    }

    return ConsultationResponse.fromEntity(consultation);
  }
}
