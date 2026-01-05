// src/infrastructure/lock/mysql-named-lock.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

/**
 * MySQL Named Lock 유틸리티
 * 멀티 인스턴스 환경에서 특정 이름의 락을 획득하여
 * 임계구역(critical section)을 보호하는 용도로 사용
 *
 * 사용처: 스케줄러, 배치 작업 등에서 중복 실행 방지
 */
@Injectable()
export class MySqlNamedLock {
  private readonly logger = new Logger(MySqlNamedLock.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * 같은 DB 세션(커넥션)에서 GET_LOCK → 임계구역 → RELEASE_LOCK 을 보장
   */
  async withLock<T>(
    name: string,
    timeoutSec: number,
    work: (qr: QueryRunner) => Promise<T>
  ): Promise<{ ok: true; value: T } | { ok: false }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    try {
      // 1) 락 획득
      const [row] = await qr.query('SELECT GET_LOCK(?, ?) AS ok', [
        name,
        timeoutSec,
      ]);
      // NOTE: row = { ok: '1' } 으로 값이 들어오므로 row.ok !== 1 을 사용시 에러발생
      if (!row || row.ok !== '1') {
        this.logger.warn(
          `Lock not acquired: "${name}" (timeout=${timeoutSec}s)`
        );
        return { ok: false };
      }

      // 2) 임계구역 실행
      const value = await work(qr);
      return { ok: true, value };
    } catch (e) {
      this.logger.error(
        `withLock(${name}) failed: ${e instanceof Error ? e.message : e}`
      );
      throw e;
    } finally {
      // 3) 락 해제(실패해도 세션 정리는 보장)
      try {
        await qr.query('SELECT RELEASE_LOCK(?)', [name]);
      } catch (e) {
        this.logger.error(
          `RELEASE_LOCK failed for "${name}": ${e instanceof Error ? e.message : e}`
        );
      }
      await qr.release();
    }
  }
}
