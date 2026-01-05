import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tour_stats_daily')
export class TourStatsDailyEntity {
  @PrimaryColumn({ name: 'stat_date', type: 'date' })
  statDate: string;

  @PrimaryColumn({ name: 'tour_id', type: 'bigint' })
  tourId: string;

  @Column({ name: 'consultations_count', type: 'int' })
  consultationsCount: number;

  @Column({ name: 'total_seconds', type: 'int' })
  totalSeconds: number;

  @Column({ name: 'avg_seconds', type: 'int' })
  avgSeconds: number;
}
