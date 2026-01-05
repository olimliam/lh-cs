// src/application/scheduler/profile-image-scheduler.jobs.ts
import { UserService } from '@/application/service/user.service';
import { MySqlNamedLock } from '@/infrastructure/lock/my-sql-named-lock';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ProfileImageSchedulerJobs {
  private readonly logger = new Logger(ProfileImageSchedulerJobs.name);

  private readonly lockName = 'cms:batch:profile-image:remove-unused';
  private readonly waitSec = 2;

  constructor(
    private readonly userService: UserService,
    private readonly lock: MySqlNamedLock
  ) {}

  // @Cron(CronExpression.EVERY_2_HOURS)
  @Cron(CronExpression.EVERY_5_MINUTES)
  async removeUnusedProfileImages(): Promise<void> {
    const res = await this.lock.withLock(
      this.lockName,
      this.waitSec,
      async (_qr) => {
        await this.userService.removeUnusedProfileImages();
      }
    );

    if (res.ok) {
      this.logger.log('S3 미사용 파일 정리 작업이 완료되었습니다.');
    } else {
      this.logger.warn('다른 인스턴스가 실행 중이어서 이번 주기는 건너뜁니다.');
    }
  }
}
