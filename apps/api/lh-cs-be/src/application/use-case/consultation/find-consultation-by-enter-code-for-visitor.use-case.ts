import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';
import { ConsultationEntity } from '@/infrastructure/repository/entity/consultation.entity';

@Injectable()
export class FindConsultationByEnterCodeForVisitorUseCase {
  private readonly logger = new Logger(
    FindConsultationByEnterCodeForVisitorUseCase.name
  );

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository
  ) {}

  async execute(enterCode: string): Promise<ConsultationEntity | null> {
    this.logger.log(`findByEnterCode called with: ${enterCode}`);

    try {
      return await this.consultationQueryRepository.findByEnterCode(enterCode);
    } catch (error) {
      this.logger.error('Failed to find consultation by enter code:', error);
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담실 조회에 실패했습니다.'
      );
    }
  }
}
