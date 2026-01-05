import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { NamingStrategyInterface } from 'typeorm';

/**
 * TBL_SUBMIT_QUEUE 테이블은 prefix 없이 사용해야 하므로,
 * CustomNamingStrategy 를 만들어서 예외처리함.
 */
export class CustomNamingStrategy
  extends SnakeNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName?: string): string {
    // 1) 먼저 기본 이름 계산 (snake_case)
    const baseName = customName ?? super.tableName(className, customName);

    // 2) 예외 테이블 처리 - prefix 붙이지 않음
    if (baseName === 'TBL_SUBMIT_QUEUE' || baseName === 'tbl_submit_queue') {
      return 'TBL_SUBMIT_QUEUE'; // DB 실제 테이블명 그대로
    }

    // 3) 나머지는 전부 lh_cs__ 붙이기
    return `lh_cs__${baseName}`;
  }
}
