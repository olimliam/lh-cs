import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConsultationService } from '../application/service/consultation.service';
import { BroadcastManagerService } from '../application/service/broadcast-manager.service';
import { MySqlNamedLock } from '@/infrastructure/lock/my-sql-named-lock';

import { QueryRunner } from 'typeorm';

@Injectable()
export class ConsultationSchedulerJobs {
  private readonly logger = new Logger(ConsultationSchedulerJobs.name);

  // ★ 분산 락 이름과 대기시간
  private readonly lockName = 'cms:batch:consultation:finalize-ended';
  private readonly purgeLockName = 'cms:batch:consultation:purge-all';
  private readonly staleReadyLockName = 'cms:batch:consultation:purge-stale-ready';
  private readonly waitSec = 1; // 즉시 실패하고 스킵(권장). 필요시 5~30초로 조정

  constructor(
    private readonly consultationService: ConsultationService,
    private readonly broadcastManager: BroadcastManagerService,
    private readonly lock: MySqlNamedLock
  ) {}

  /**
   * 1분마다 실행되는 상담 종료 배치 작업
   * - status=END이고 endRequestedAt이 5분 이상 경과된 상담실을 찾아서
   * - isActive=false로 변경 (실제 종료 처리)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async lockedFinalizeEndedConsultations(): Promise<void> {
    this.logger.debug('cron tick: trying to acquire lock'); // 사전 로그

    await this.lock.withLock(this.lockName, this.waitSec, async (qr) => {
      await this.finalizeEndedConsultations(qr);
    });
  }

  /**
   * 매일 00:00 전체 상담 데이터 정리
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeAllConsultations(): Promise<void> {
    this.logger.debug('cron tick: trying to acquire lock (midnight purge)');
    await this.lock.withLock(this.purgeLockName, this.waitSec, async (qr) => {
      await this.runMidnightPurge(qr);
    });
  }

  /**
   * 5분 주기 READY 상담실 만료 정리 (1시간 초과)
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async purgeStaleReadyConsultations(): Promise<void> {
    this.logger.debug('cron tick: trying to acquire lock (stale READY purge)');
    await this.lock.withLock(
      this.staleReadyLockName,
      this.waitSec,
      async (qr) => {
        const threshold = new Date(Date.now() - 60 * 60 * 1000);
        await this.runStaleReadyPurge(qr, threshold);
      }
    );
  }

  async finalizeEndedConsultations(qr: QueryRunner): Promise<void> {
    this.logger.log('락 획득 이후 consultation finalization batch job 실행');
    const em = qr.manager;
    await qr.startTransaction();
    try {
      // 1. 5분이 지난 종료 요청된 상담실 조회
      const consultationIds =
        await this.consultationService.findConsultationsToFinalize(em);

      if (consultationIds.length === 0) {
        this.logger.log('No consultations to finalize');
        await qr.commitTransaction(); // ← 트랜잭션 정상 종료
        return;
      }

      this.logger.log(
        `Found ${consultationIds.length} consultations to finalize: [${consultationIds.join(', ')}]`
      );

      // 2. 각 상담실을 완전 종료 처리
      let successCount = 0;
      let errorCount = 0;

      for (const consultationId of consultationIds) {
        try {
          await this.consultationService.finalizeEndConsultation(
            em,
            consultationId
          );
          successCount++;
          this.logger.log(
            `Consultation ${consultationId} finalized successfully`
          );
        } catch (error) {
          await qr.rollbackTransaction();
          errorCount++;
          this.logger.error(
            `Failed to finalize consultation ${consultationId}:`,
            error
          );
        }
      }

      this.logger.log(
        `Batch job completed. Success: ${successCount}, Errors: ${errorCount}`
      );
      await qr.commitTransaction();
      // WebSocket으로 종료 완료 이벤트 발송
      if (successCount > 0) {
        await this.notifyConsultationFinalized(
          consultationIds.slice(0, successCount)
        );
      }
    } catch (error) {
      await qr.rollbackTransaction();
      this.logger.error('Consultation finalization batch job failed:', error);
    }
  }

  private async runMidnightPurge(qr: QueryRunner): Promise<void> {
    this.logger.log('락 획득 이후 midnight purge 실행');
    try {
      const result = await this.consultationService.purgeAllConsultations(qr);
      this.logger.log(
        `Midnight purge completed. consultations=${result.consultationsDeleted}, read_consultations=${result.readDeleted}`
      );
    } catch (error) {
      this.logger.error('Midnight purge failed:', error);
    }
  }

  private async runStaleReadyPurge(
    qr: QueryRunner,
    threshold: Date
  ): Promise<void> {
    this.logger.log(
      `락 획득 이후 stale READY purge 실행 (olderThan=${threshold.toISOString()})`
    );
    try {
      const result =
        await this.consultationService.deleteStaleReadyConsultations(
          qr,
          threshold
        );
      this.logger.log(
        `Stale READY purge completed. consultations=${result.consultationsDeleted}, read_consultations=${result.readDeleted}, ids=[${result.deletedIds.join(', ')}]`
      );
    } catch (error) {
      this.logger.error('Stale READY purge failed:', error);
    }
  }

  /**
   * WebSocket을 통한 상담 완전 종료 알림
   */
  private async notifyConsultationFinalized(
    consultationIds: string[]
  ): Promise<void> {
    try {
      // 자체 WebSocket Gateway를 통해 상담 종료 이벤트 발송
      for (const consultationId of consultationIds) {
        try {
          this.broadcastManager.broadcastConsultationEnded(consultationId);
        } catch (error) {
          this.logger.error(
            `Error broadcasting consultation ended event for consultation ${consultationId}:`,
            error
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in notifyConsultationFinalized:', error);
    }
  }
}
