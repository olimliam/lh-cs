import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultationEntity } from './entity/consultation.entity';
import { normalizeDateRange } from '@/common/utils/date-range.util';

export interface ConsultationSummaryRaw {
  totalCount: string | null;
  totalDurationSec: string | null;
  averageDurationSec: string | null;
}

export interface ConsultationTrendRaw {
  statDate: string;
  consultationCount: string;
  averageDurationSec: string | null;
}

export interface TopItemRaw {
  id: string;
  title: string;
  consultationCount: string;
  totalDurationSec: string | null;
}

export interface TourTrendRaw {
  tourId: string;
  tourTitle: string;
  statDate: string;
  consultationCount: string;
}

export interface TourAggregateRaw {
  tourId: string;
  tourTitle: string;
  consultationCount: string;
  totalDurationSec: string | null;
  averageDurationSec: string | null;
}

export interface FacilityAggregateRaw {
  facilityId: string;
  facilityTitle: string;
  consultationCount: string;
  totalDurationSec: string | null;
  averageDurationSec: string | null;
}

@Injectable()
export class ConsultationStatisticsRepository {
  constructor(
    @InjectRepository(ConsultationEntity)
    private readonly consultationRepo: Repository<ConsultationEntity>
  ) {}

  async getConsultationSummary(
    start: Date,
    end: Date
  ): Promise<ConsultationSummaryRaw> {
    const [startUtc, endUtc] = normalizeDateRange(start, end);

    const result = await this.consultationRepo
      .createQueryBuilder('c')
      .select('COUNT(*)', 'totalCount')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'totalDurationSec'
      )
      .addSelect(
        'AVG(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'averageDurationSec'
      )
      .where('c.consultingStartedAt BETWEEN :start AND :end', {
        start: startUtc,
        end: endUtc,
      })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .getRawOne();

    return (
      result ?? {
        totalCount: '0',
        totalDurationSec: '0',
        averageDurationSec: '0',
      }
    );
  }

  async getConsultationTrend(
    start: Date,
    end: Date,
    timezone: string
  ): Promise<ConsultationTrendRaw[]> {
    const [startUtc, endUtc] = normalizeDateRange(start, end);

    return this.consultationRepo
      .createQueryBuilder('c')
      .select(
        `DATE(CONVERT_TZ(c.consultingStartedAt, '+00:00', :timezone))`,
        'statDate'
      )
      .addSelect('COUNT(*)', 'consultationCount')
      .addSelect(
        'AVG(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'averageDurationSec'
      )
      .where('c.consultingStartedAt BETWEEN :start AND :end', {
        start: startUtc,
        end: endUtc,
      })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .groupBy('statDate')
      .orderBy('statDate', 'ASC')
      .setParameter('timezone', timezone)
      .getRawMany();
  }

  async getTopTours(since: Date, limit: number): Promise<TopItemRaw[]> {
    return this.consultationRepo
      .createQueryBuilder('c')
      .innerJoin('c.tour', 't')
      .select('c.tourId', 'id')
      .addSelect('t.title', 'title')
      .addSelect('COUNT(*)', 'consultationCount')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'totalDurationSec'
      )
      .where('c.consultingStartedAt >= :since', { since })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .groupBy('c.tourId')
      .addGroupBy('t.title')
      .orderBy('consultationCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTopFacilities(since: Date, limit: number): Promise<TopItemRaw[]> {
    return this.consultationRepo
      .createQueryBuilder('c')
      .innerJoin('c.startTourFacility', 'tf')
      .innerJoin('tf.facility', 'f')
      .select('tf.facilityId', 'id')
      .addSelect('f.title', 'title')
      .addSelect('COUNT(*)', 'consultationCount')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'totalDurationSec'
      )
      .where('c.consultingStartedAt >= :since', { since })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .groupBy('tf.facilityId')
      .addGroupBy('f.title')
      .orderBy('consultationCount', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTourTrend(
    start: Date,
    end: Date,
    timezone: string,
    tourIds: string[]
  ): Promise<TourTrendRaw[]> {
    if (tourIds.length === 0) {
      return [];
    }

    const [startUtc, endUtc] = normalizeDateRange(start, end);

    return this.consultationRepo
      .createQueryBuilder('c')
      .innerJoin('c.tour', 't')
      .select('c.tourId', 'tourId')
      .addSelect('t.title', 'tourTitle')
      .addSelect(
        `DATE(CONVERT_TZ(c.consultingStartedAt, '+00:00', :timezone))`,
        'statDate'
      )
      .addSelect('COUNT(*)', 'consultationCount')
      .where('c.consultingStartedAt BETWEEN :start AND :end', {
        start: startUtc,
        end: endUtc,
      })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.tourId IN (:...tourIds)', { tourIds })
      .groupBy('c.tourId')
      .addGroupBy('t.title')
      .addGroupBy('statDate')
      .orderBy('statDate', 'ASC')
      .setParameter('timezone', timezone)
      .getRawMany();
  }

  async getTourAggregates(
    start: Date,
    end: Date,
    tourIds: string[]
  ): Promise<TourAggregateRaw[]> {
    if (tourIds.length === 0) {
      return [];
    }

    const [startUtc, endUtc] = normalizeDateRange(start, end);

    return this.consultationRepo
      .createQueryBuilder('c')
      .innerJoin('c.tour', 't')
      .select('c.tourId', 'tourId')
      .addSelect('t.title', 'tourTitle')
      .addSelect('COUNT(*)', 'consultationCount')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'totalDurationSec'
      )
      .addSelect(
        'AVG(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'averageDurationSec'
      )
      .where('c.consultingStartedAt BETWEEN :start AND :end', {
        start: startUtc,
        end: endUtc,
      })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .andWhere('c.tourId IN (:...tourIds)', { tourIds })
      .groupBy('c.tourId')
      .addGroupBy('t.title')
      .orderBy('consultationCount', 'DESC')
      .getRawMany();
  }

  async getFacilityAggregates(
    start: Date,
    end: Date,
    facilityIds: string[]
  ): Promise<FacilityAggregateRaw[]> {
    if (facilityIds.length === 0) {
      return [];
    }

    const [startUtc, endUtc] = normalizeDateRange(start, end);

    return this.consultationRepo
      .createQueryBuilder('c')
      .innerJoin('c.startTourFacility', 'tf')
      .innerJoin('tf.facility', 'f')
      .select('tf.facilityId', 'facilityId')
      .addSelect('f.title', 'facilityTitle')
      .addSelect('COUNT(*)', 'consultationCount')
      .addSelect(
        'SUM(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'totalDurationSec'
      )
      .addSelect(
        'AVG(TIMESTAMPDIFF(SECOND, c.consultingStartedAt, c.endRequestedAt))',
        'averageDurationSec'
      )
      .where('c.consultingStartedAt BETWEEN :start AND :end', {
        start: startUtc,
        end: endUtc,
      })
      .andWhere('c.consultingStartedAt IS NOT NULL')
      .andWhere('c.endRequestedAt IS NOT NULL')
      .andWhere('tf.facilityId IN (:...facilityIds)', { facilityIds })
      .groupBy('tf.facilityId')
      .addGroupBy('f.title')
      .orderBy('consultationCount', 'DESC')
      .getRawMany();
  }
}
