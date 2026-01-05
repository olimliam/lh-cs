import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { SearchConsultationQuery } from '@/application/dto/query';
import { ConsultationResponse } from '@/presentation/dto/response';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class SearchConsultationsUseCase {
  private readonly logger = new Logger(SearchConsultationsUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository
  ) {}

  async execute(
    searchDto: SearchConsultationQuery
  ): Promise<ConsultationResponse[]> {
    this.logger.log(
      `searchConsultations called with: ${JSON.stringify(searchDto)}`
    );

    try {
      const consultations =
        await this.consultationQueryRepository.search(searchDto);
      return consultations.map((consultation) =>
        ConsultationResponse.fromEntity(consultation)
      );
    } catch (error) {
      this.logger.error('Failed to search consultations:', error);
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_FETCH_FAILED,
        HttpStatus.BAD_REQUEST,
        '상담실 검색에 실패했습니다.'
      );
    }
  }
}
