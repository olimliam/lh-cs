import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConsultationQueryRepository } from '@/infrastructure/repository/query/consultation-query.repository';
import { ConsultationStatsQuery } from '@/application/dto/query';
import { CustomException } from '@/common/exception/custom.exception';
import { ConsultationErrorCode } from '@/common/exception/error';

@Injectable()
export class GetDashboardStatsUseCase {
  private readonly logger = new Logger(GetDashboardStatsUseCase.name);

  constructor(
    private readonly consultationQueryRepository: ConsultationQueryRepository
  ) {}

  async execute(userId?: string): Promise<ConsultationStatsQuery> {
    this.logger.log(
      `getDashboardStats called for user: ${userId ?? 'ALL'}`
    );

    try {
      return await this.consultationQueryRepository.getConsultationStats(
        userId
      );
    } catch (error) {
      this.logger.error('Failed to get dashboard stats:', error);
      throw new CustomException(
        ConsultationErrorCode.CONSULTATION_STATS_FAILED,
        HttpStatus.BAD_REQUEST,
        '대시보드 통계 조회에 실패했습니다.'
      );
    }
  }
}
