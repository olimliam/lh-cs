import { Injectable, Logger } from '@nestjs/common';
import { ConsultationStatisticsV2Repository } from '@/infrastructure/repository/consultation-statistics-v2.repository';

@Injectable()
export class StatisticsAggregationService {
  private readonly logger = new Logger(StatisticsAggregationService.name);

  constructor(
    private readonly statisticsRepository: ConsultationStatisticsV2Repository
  ) {}

  /**
   * 일자별 정규화된 상담 세션을 집계 테이블에 적재
   * - statDate: 'YYYY-MM-DD' (UTC 기준)
   */
  async aggregateForDate(statDate: string): Promise<void> {
    const normalizedDate = this.normalizeDate(statDate);
    this.logger.log(
      `Aggregating consultation statistics for ${normalizedDate}`
    );
    await this.statisticsRepository.aggregateDaily(normalizedDate);
  }

  /**
   * startDate~endDate 구간을 순회하며 일별 집계를 수행
   * - 양 끝단 포함, UTC 기준
   */
  async aggregateForRange(startDate: string, endDate: string): Promise<void> {
    let cursor = new Date(`${this.normalizeDate(startDate)}T00:00:00.000Z`);
    const end = new Date(`${this.normalizeDate(endDate)}T00:00:00.000Z`);

    while (cursor <= end) {
      const statDate = cursor.toISOString().slice(0, 10);
      await this.aggregateForDate(statDate);
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  private normalizeDate(value: string): string {
    // YYYY-MM-DD 형태만 허용
    const match = /^\\d{4}-\\d{2}-\\d{2}$/.test(value);
    if (!match) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }
    return value;
  }
}
