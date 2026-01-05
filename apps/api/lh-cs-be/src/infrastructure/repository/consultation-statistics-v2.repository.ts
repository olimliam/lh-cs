import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ConsultationLogEntity } from './entity/consultation-log.entity';
import { TourStatsDailyEntity } from './entity/tour-stats-daily.entity';
import { TourFacilityStatsDailyEntity } from './entity/tour-facility-stats-daily.entity';
import { TourFacilityEntity } from './entity/tour-facility.entity';
import { ConsultationLogActionTypeEnum } from '@/presentation/dto/request/create-consultation-log.request';

export interface StatsFilter {
  startDate: string;
  endDate: string;
  tourIds?: string[];
  facilityIds?: string[];
  consultantIds?: string[];
}

export interface SessionViewRow {
  consultationId: string;
  tourKey?: string | null;
  facilityKey?: string | null;
  consultantId?: string | null;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  statDate: string;
}

export interface SessionListResult {
  data: SessionViewRow[];
  total: number;
}

@Injectable()
export class ConsultationStatisticsV2Repository {
  private readonly logger = new Logger(ConsultationStatisticsV2Repository.name);
  private readonly sessionStartActions = [
    ConsultationLogActionTypeEnum.COUNSELOR_ENTER,
    ConsultationLogActionTypeEnum.ADMIN_ENTER,
    ConsultationLogActionTypeEnum.CONSULTATION_CREATE,
  ];
  private readonly sessionEndActions = [
    ConsultationLogActionTypeEnum.CONSULTATION_DESTROY,
    ConsultationLogActionTypeEnum.COUNSELOR_EXIT,
  ];

  constructor(private readonly dataSource: DataSource) {}

  async aggregateDaily(statDate: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.aggregateTourStatsForDate(manager, statDate);
      await this.aggregateFacilityStatsForDate(manager, statDate);
    });
  }

  async getSessionList(
    filter: StatsFilter,
    skip: number,
    take: number,
    orderByDuration: 'ASC' | 'DESC'
  ): Promise<SessionListResult> {
    const qb = this.buildSessionViewQuery(this.dataSource.manager, filter);

    const total = await this.dataSource.manager
      .createQueryBuilder()
      .select()
      .from(`(${qb.getQuery()})`, 'session_count')
      .setParameters(qb.getParameters())
      .getCount();

    const data = await this.dataSource.manager
      .createQueryBuilder()
      .select('*')
      .from(`(${qb.getQuery()})`, 'session')
      .orderBy('session.durationSeconds', orderByDuration)
      .addOrderBy('session.startedAt', 'DESC')
      .offset(skip)
      .limit(take)
      .setParameters(qb.getParameters())
      .getRawMany<SessionViewRow>();

    return { data, total };
  }

  async getTourStats(filter: StatsFilter): Promise<TourStatsDailyEntity[]> {
    const repo = this.dataSource.getRepository(TourStatsDailyEntity);
    const qb = repo
      .createQueryBuilder('stats')
      .where('stats.statDate BETWEEN :startDate AND :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      });

    if (filter.tourIds?.length) {
      qb.andWhere('stats.tourId IN (:...tourIds)', {
        tourIds: filter.tourIds,
      });
    }

    return qb.orderBy('stats.statDate', 'ASC').getMany();
  }

  async getFacilityStats(
    filter: StatsFilter
  ): Promise<TourFacilityStatsDailyEntity[]> {
    const repo = this.dataSource.getRepository(TourFacilityStatsDailyEntity);
    const qb = repo
      .createQueryBuilder('stats')
      .where('stats.statDate BETWEEN :startDate AND :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      });

    if (filter.tourIds?.length) {
      qb.andWhere('stats.tourId IN (:...tourIds)', {
        tourIds: filter.tourIds,
      });
    }

    if (filter.facilityIds?.length) {
      qb.andWhere(
        '(stats.facilityId IN (:...facilityIds) OR stats.tourFacilityId IN (:...facilityIds))',
        { facilityIds: filter.facilityIds }
      );
    }

    return qb.orderBy('stats.statDate', 'ASC').getMany();
  }

  async getTourStatsFromSessions(
    filter: StatsFilter
  ): Promise<TourStatsDailyEntity[]> {
    const sessionView = this.buildSessionViewQuery(
      this.dataSource.manager,
      filter
    );
    const rows = await this.dataSource.manager
      .createQueryBuilder()
      .select('session.statDate', 'statDate')
      .addSelect('session.tourKey', 'tourId')
      .addSelect('COUNT(*)', 'consultationsCount')
      .addSelect('SUM(session.durationSeconds)', 'totalSeconds')
      .addSelect('AVG(session.durationSeconds)', 'avgSeconds')
      .from(`(${sessionView.getQuery()})`, 'session')
      .where('session.tourKey IS NOT NULL')
      .groupBy('session.statDate')
      .addGroupBy('session.tourKey')
      .orderBy('session.statDate', 'ASC')
      .addOrderBy('session.tourKey', 'ASC')
      .setParameters(sessionView.getParameters())
      .getRawMany<{
        statDate: string;
        tourId: string;
        consultationsCount: string;
        totalSeconds: string | null;
        avgSeconds: string | null;
      }>();

    return rows.map((row) => ({
      statDate: row.statDate,
      tourId: row.tourId,
      consultationsCount: Number(row.consultationsCount ?? 0),
      totalSeconds: Number(row.totalSeconds ?? 0),
      avgSeconds: Math.round(Number(row.avgSeconds ?? 0)),
    }));
  }

  async getFacilityStatsFromSessions(
    filter: StatsFilter
  ): Promise<TourFacilityStatsDailyEntity[]> {
    const sessionView = this.buildSessionViewQuery(
      this.dataSource.manager,
      filter
    );
    const qb = this.dataSource.manager
      .createQueryBuilder()
      .select('session.statDate', 'statDate')
      .addSelect('tf.id', 'tourFacilityId')
      .addSelect('tf.tourId', 'tourId')
      .addSelect('tf.facilityId', 'facilityId')
      .addSelect('COUNT(*)', 'consultationsCount')
      .addSelect('SUM(session.durationSeconds)', 'totalSeconds')
      .addSelect('AVG(session.durationSeconds)', 'avgSeconds')
      .from(`(${sessionView.getQuery()})`, 'session')
      .innerJoin(
        TourFacilityEntity,
        'tf',
        '(tf.tourId = session.tourKey) AND (tf.id = session.facilityKey OR tf.facilityId = session.facilityKey OR tf.sceneId = session.facilityKey)'
      )
      .where('session.tourKey IS NOT NULL')
      .andWhere('session.facilityKey IS NOT NULL')
      .groupBy('session.statDate')
      .addGroupBy('tf.id')
      .addGroupBy('tf.tourId')
      .addGroupBy('tf.facilityId')
      .orderBy('session.statDate', 'ASC')
      .addOrderBy('tf.tourId', 'ASC')
      .setParameters(sessionView.getParameters());

    if (filter.facilityIds?.length) {
      qb.andWhere(
        '(tf.id IN (:...facilityIds) OR tf.facilityId IN (:...facilityIds))',
        { facilityIds: filter.facilityIds }
      );
    }

    const rows = await qb.getRawMany<{
      statDate: string;
      tourFacilityId: string;
      tourId: string;
      facilityId: string;
      consultationsCount: string;
      totalSeconds: string | null;
      avgSeconds: string | null;
    }>();

    return rows.map((row) => ({
      statDate: row.statDate,
      tourFacilityId: row.tourFacilityId,
      tourId: row.tourId,
      facilityId: row.facilityId,
      consultationsCount: Number(row.consultationsCount ?? 0),
      totalSeconds: Number(row.totalSeconds ?? 0),
      avgSeconds: Math.round(Number(row.avgSeconds ?? 0)),
    }));
  }

  private buildSessionViewQuery(manager: EntityManager, filter: StatsFilter) {
    const base = manager
      .createQueryBuilder()
      .from(ConsultationLogEntity, 'log')
      .select('log.consultationId', 'consultationId')
      .addSelect(
        `MIN(CASE WHEN log.actionType IN (:...startActions) THEN log.createdAt END)`,
        'startedAt'
      )
      .addSelect(
        `MAX(CASE WHEN log.actionType IN (:...endActions) THEN log.createdAt END)`,
        'endedAt'
      )
      .addSelect(
        `MAX(CASE WHEN log.actionType = :counselorEnter THEN log.counselorId END)`,
        'consultantId'
      )
      .addSelect('MAX(log.tourId)', 'tourKey')
      .addSelect('MAX(log.facilityId)', 'facilityKey')
      .groupBy('log.consultationId')
      .having(
        `MIN(CASE WHEN log.actionType IN (:...startActions) THEN log.createdAt END) IS NOT NULL`
      )
      .andHaving(
        `MAX(CASE WHEN log.actionType IN (:...endActions) THEN log.createdAt END) IS NOT NULL`
      )
      .setParameters({
        startActions: this.sessionStartActions,
        endActions: this.sessionEndActions,
        counselorEnter: ConsultationLogActionTypeEnum.COUNSELOR_ENTER,
      });

    const qb = manager
      .createQueryBuilder()
      .select('session.consultationId', 'consultationId')
      .addSelect('session.tourKey', 'tourKey')
      .addSelect('session.facilityKey', 'facilityKey')
      .addSelect('session.consultantId', 'consultantId')
      .addSelect('session.startedAt', 'startedAt')
      .addSelect('session.endedAt', 'endedAt')
      .addSelect(
        'GREATEST(0, TIMESTAMPDIFF(SECOND, session.startedAt, session.endedAt))',
        'durationSeconds'
      )
      .addSelect('DATE(session.startedAt)', 'statDate')
      .from(`(${base.getQuery()})`, 'session')
      .where('session.startedAt IS NOT NULL')
      .andWhere('session.endedAt IS NOT NULL')
      .andWhere('session.endedAt >= session.startedAt')
      .setParameters(base.getParameters());

    qb.andWhere('DATE(session.startedAt) BETWEEN :startDate AND :endDate', {
      startDate: filter.startDate,
      endDate: filter.endDate,
    });

    if (filter.tourIds?.length) {
      qb.andWhere('session.tourKey IN (:...tourIds)', {
        tourIds: filter.tourIds,
      });
    }

    if (filter.facilityIds?.length) {
      qb.andWhere('session.facilityKey IN (:...facilityIds)', {
        facilityIds: filter.facilityIds,
      });
    }

    if (filter.consultantIds?.length) {
      qb.andWhere('session.consultantId IN (:...consultantIds)', {
        consultantIds: filter.consultantIds,
      });
    }

    return qb;
  }

  private async aggregateTourStatsForDate(
    manager: EntityManager,
    statDate: string
  ) {
    const sessionView = this.buildSessionViewQuery(manager, {
      startDate: statDate,
      endDate: statDate,
    });

    const rows = await manager
      .createQueryBuilder()
      .select('session.statDate', 'statDate')
      .addSelect('session.tourKey', 'tourId')
      .addSelect('COUNT(*)', 'consultationsCount')
      .addSelect('SUM(session.durationSeconds)', 'totalSeconds')
      .addSelect('AVG(session.durationSeconds)', 'avgSeconds')
      .from(`(${sessionView.getQuery()})`, 'session')
      .where('session.tourKey IS NOT NULL')
      .groupBy('session.statDate')
      .addGroupBy('session.tourKey')
      .setParameters(sessionView.getParameters())
      .getRawMany<{
        statDate: string;
        tourId: string;
        consultationsCount: string;
        totalSeconds: string | null;
        avgSeconds: string | null;
      }>();

    await manager.getRepository(TourStatsDailyEntity).delete({ statDate });

    if (!rows.length) {
      this.logger.log(`No tour stats to aggregate for ${statDate}`);
      return;
    }

    const records = rows.map((row) => ({
      statDate: row.statDate,
      tourId: row.tourId,
      consultationsCount: Number(row.consultationsCount ?? 0),
      totalSeconds: Number(row.totalSeconds ?? 0),
      avgSeconds: Math.round(Number(row.avgSeconds ?? 0)),
    }));

    await manager.getRepository(TourStatsDailyEntity).insert(records);
  }

  private async aggregateFacilityStatsForDate(
    manager: EntityManager,
    statDate: string
  ) {
    const sessionView = this.buildSessionViewQuery(manager, {
      startDate: statDate,
      endDate: statDate,
    });

    const rows = await manager
      .createQueryBuilder()
      .select('session.statDate', 'statDate')
      .addSelect('tf.id', 'tourFacilityId')
      .addSelect('tf.tourId', 'tourId')
      .addSelect('tf.facilityId', 'facilityId')
      .addSelect('COUNT(*)', 'consultationsCount')
      .addSelect('SUM(session.durationSeconds)', 'totalSeconds')
      .addSelect('AVG(session.durationSeconds)', 'avgSeconds')
      .from(`(${sessionView.getQuery()})`, 'session')
      .innerJoin(
        TourFacilityEntity,
        'tf',
        '(tf.tourId = session.tourKey) AND (tf.id = session.facilityKey OR tf.facilityId = session.facilityKey OR tf.sceneId = session.facilityKey)'
      )
      .where('session.tourKey IS NOT NULL')
      .andWhere('session.facilityKey IS NOT NULL')
      .groupBy('session.statDate')
      .addGroupBy('tf.id')
      .addGroupBy('tf.tourId')
      .addGroupBy('tf.facilityId')
      .setParameters(sessionView.getParameters())
      .getRawMany<{
        statDate: string;
        tourFacilityId: string;
        tourId: string;
        facilityId: string;
        consultationsCount: string;
        totalSeconds: string | null;
        avgSeconds: string | null;
      }>();

    await manager
      .getRepository(TourFacilityStatsDailyEntity)
      .delete({ statDate });

    if (!rows.length) {
      this.logger.log(`No facility stats to aggregate for ${statDate}`);
      return;
    }

    const records = rows.map((row) => ({
      statDate: row.statDate,
      tourFacilityId: row.tourFacilityId,
      tourId: row.tourId,
      facilityId: row.facilityId,
      consultationsCount: Number(row.consultationsCount ?? 0),
      totalSeconds: Number(row.totalSeconds ?? 0),
      avgSeconds: Math.round(Number(row.avgSeconds ?? 0)),
    }));

    await manager.getRepository(TourFacilityStatsDailyEntity).insert(records);
  }
}
