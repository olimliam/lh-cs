import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StatisticsAggregationService } from '@/application/service/statistics-aggregation.service';
import { MySqlNamedLock } from '@/infrastructure/lock/my-sql-named-lock';

@Injectable()
export class StatisticsAggregationJobs {
  private readonly logger = new Logger(StatisticsAggregationJobs.name);
  private readonly lockName = 'cms:batch:statistics:aggregate-daily';
  private readonly waitSec = 5;

  constructor(
    private readonly aggregationService: StatisticsAggregationService,
    private readonly lock: MySqlNamedLock
  ) {}

  /**
   * 매일 01:00 UTC (KST 10:00)에 전일 상담 로그를 집계 테이블에 적재
   * - 통계 집계는 휘발성 테이블을 건드리지 않고 consultation_log 기반으로만 수행
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async aggregateYesterday(): Promise<void> {
    const targetDate = this.getYesterday();
    this.logger.log(`cron tick: aggregating statistics for ${targetDate}`);

    await this.lock.withLock(this.lockName, this.waitSec, async () => {
      await this.aggregationService.aggregateForDate(targetDate);
    });
  }

  private getYesterday(): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }
}
