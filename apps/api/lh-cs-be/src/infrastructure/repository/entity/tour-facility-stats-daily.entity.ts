import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tour_facility_stats_daily')
export class TourFacilityStatsDailyEntity {
  @PrimaryColumn({ name: 'stat_date', type: 'date' })
  statDate: string;

  @PrimaryColumn({ name: 'tour_facility_id', type: 'bigint' })
  tourFacilityId: string;

  @Column({ name: 'tour_id', type: 'bigint' })
  tourId: string;

  @Column({ name: 'facility_id', type: 'bigint' })
  facilityId: string;

  @Column({ name: 'consultations_count', type: 'int' })
  consultationsCount: number;

  @Column({ name: 'total_seconds', type: 'int' })
  totalSeconds: number;

  @Column({ name: 'avg_seconds', type: 'int' })
  avgSeconds: number;
}
