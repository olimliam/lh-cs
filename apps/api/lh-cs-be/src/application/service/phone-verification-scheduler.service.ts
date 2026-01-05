import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PhoneVerificationService } from './phone-verification.service';

@Injectable()
export class PhoneVerificationSchedulerService {
  private readonly logger = new Logger(PhoneVerificationSchedulerService.name);

  constructor(private readonly phoneVerificationService: PhoneVerificationService) {}

  @Cron(CronExpression.EVERY_3_HOURS)
  async cleanupExpiredPhoneVerifications(): Promise<void> {
    this.logger.log('Starting phone verification cleanup job');

    try {
      const removed = await this.phoneVerificationService.cleanupExpiredVerifications();
      this.logger.log(`Phone verification cleanup completed. Removed ${removed} expired records.`);
    } catch (error) {
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Phone verification cleanup job failed', stack);
    }
  }
}
