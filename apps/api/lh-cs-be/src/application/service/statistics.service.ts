import { HttpStatus, Injectable } from '@nestjs/common';
import { AdminLogRepository } from '@/infrastructure/repository/admin-log.repository';
import { LoginLogRepository } from '@/infrastructure/repository/login-log.repository';
import { FreeTourLogRepository } from '@/infrastructure/repository/free-tour-log.repository';
import { ConsultationLogRepository } from '@/infrastructure/repository/consultation-log.repository';
import { ConsultationStatisticsRepository } from '@/infrastructure/repository/consultation-statistics.repository';
import {
  ConsultationStatisticsV2Repository,
  SessionViewRow,
  StatsFilter,
} from '@/infrastructure/repository/consultation-statistics-v2.repository';
import {
  ConsultationOverviewResponse,
  ConsultationSummaryResponse,
  ConsultationTrendItemResponse,
  FacilityAggregateItemResponse,
  FacilityStatisticsResponse,
  FacilityStatisticsTotalResponse,
  TopConsultationItemResponse,
  TourAggregateItemResponse,
  TourStatisticsResponse,
  TourStatisticsTotalResponse,
  TourTrendItemResponse,
} from '@/presentation/dto/response/consultation-statistics.response';
import { GetConsultationOverviewRequest } from '@/presentation/dto/request/get-consultation-overview.request';
import { GetTourStatisticsRequest } from '@/presentation/dto/request/get-tour-statistics.request';
import { GetFacilityStatisticsRequest } from '@/presentation/dto/request/get-facility-statistics.request';
import { GetDashboardStatisticsRequest } from '@/presentation/dto/request/get-dashboard-statistics.request';
import { GetTourStatisticsV2Request } from '@/presentation/dto/request/get-tour-statistics-v2.request';
import { GetFacilityStatisticsV2Request } from '@/presentation/dto/request/get-facility-statistics-v2.request';
import { GetConsultationSessionsRequest } from '@/presentation/dto/request/get-consultation-sessions.request';
import { normalizeDateRange } from '@/common/utils/date-range.util';
import { normalizeIp } from '@/common/utils/ip-utils';
import { GetAdminLogsRequest } from '@/presentation/dto/request/get-admin-logs.request';
import { GetLoginLogsRequest } from '@/presentation/dto/request/get-login-logs.request';
import { GetFreeTourLogsRequest } from '@/presentation/dto/request/get-free-tour-logs.request';
import { GetConsultationLogsRequest } from '@/presentation/dto/request/get-consultation-logs.request';
import { CreateAdminLogRequest } from '@/presentation/dto/request/create-admin-log.request';
import { CreateLoginLogRequest } from '@/presentation/dto/request/create-login-log.request';
import { CreateFreeTourLogRequest } from '@/presentation/dto/request/create-free-tour-log.request';
import { CreateConsultationLogRequest } from '@/presentation/dto/request/create-consultation-log.request';
import { DataSource, In } from 'typeorm';
import {
  PaginatedAdminLogsResponse,
  PaginatedConsultationLogsResponse,
  PaginatedFreeTourLogsResponse,
  PaginatedLoginLogsResponse,
  AdminLogItemDto,
  ConsultationLogItemDto,
  FreeTourLogItemDto,
  LoginLogItemDto,
} from '@/presentation/dto/response/logs.response';
import { CreateLogResponse } from '@/presentation/dto/response/create-log.response';
import { AdminLogEntity } from '@/infrastructure/repository/entity/admin-log.entity';
import { LoginLogEntity } from '@/infrastructure/repository/entity/login-log.entity';
import { FreeTourLogEntity } from '@/infrastructure/repository/entity/free-tour-log.entity';
import { ConsultationLogEntity } from '@/infrastructure/repository/entity/consultation-log.entity';
import { TourStatsDailyEntity } from '@/infrastructure/repository/entity/tour-stats-daily.entity';
import { TourFacilityStatsDailyEntity } from '@/infrastructure/repository/entity/tour-facility-stats-daily.entity';
import { TourEntity } from '@/infrastructure/repository/entity/tour.entity';
import { TourFacilityEntity } from '@/infrastructure/repository/entity/tour-facility.entity';
import { CustomException } from '@/common/exception/custom.exception';
import { StatisticsErrorCode } from '@/common/exception/error';
import { StatsFilterDto } from '@/presentation/dto/request/stats-filter.dto';
import {
  ConsultationSessionItemResponse,
  DashboardStatisticsResponse,
  DashboardSummaryDto,
  DashboardSummaryResponse,
  DashboardTopFacilitiesResponse,
  DashboardTopToursResponse,
  DashboardTrendItemDto,
  DashboardTrendResponse,
  FacilityAggregateStatDto,
  FacilityDailyStatDto,
  FacilityStatisticsV2Response,
  PaginatedConsultationSessionsResponse,
  TourAggregateStatDto,
  TourDailyStatDto,
  TourStatisticsV2Response,
} from '@/presentation/dto/response';
import { IpEncryptionService } from './ip-encryption.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly adminLogRepository: AdminLogRepository,
    private readonly loginLogRepository: LoginLogRepository,
    private readonly freeTourLogRepository: FreeTourLogRepository,
    private readonly consultationLogRepository: ConsultationLogRepository,
    private readonly consultationStatisticsRepository: ConsultationStatisticsRepository,
    private readonly consultationStatisticsV2Repository: ConsultationStatisticsV2Repository,
    private readonly ipEncryptionService: IpEncryptionService
  ) {}

  async getAdminLogs(
    query: GetAdminLogsRequest
  ): Promise<PaginatedAdminLogsResponse> {
    const { data, total } = await this.adminLogRepository.findAll(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return new PaginatedAdminLogsResponse({
      data: data.map(
        (item): AdminLogItemDto => ({
          id: item.id,
          actionType: item.actionType,
          actionValue: item.actionValue,
          counselorId: item.counselorId,
          device: item.device,
          ipAddress: this.decryptIp(item.ipAddress),
          createdAt: item.createdAt,
        })
      ),
      total,
      page,
      limit,
      totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    });
  }

  async getLoginLogs(
    query: GetLoginLogsRequest
  ): Promise<PaginatedLoginLogsResponse> {
    const ipCandidates = this.buildEncryptedSearchCandidates(query.ipAddress);
    const { data, total } = await this.loginLogRepository.findAll({
      ...query,
      ipAddress: ipCandidates,
    });

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return new PaginatedLoginLogsResponse({
      data: data.map(
        (item): LoginLogItemDto => ({
          id: item.id,
          actionType: item.actionType,
          actionValue: item.actionValue,
          counselorId: item.counselorId,
          device: item.device,
          ipAddress: this.decryptIp(item.ipAddress),
          createdAt: item.createdAt,
        })
      ),
      total,
      page,
      limit,
      totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    });
  }

  async getFreeTourLogs(
    query: GetFreeTourLogsRequest
  ): Promise<PaginatedFreeTourLogsResponse> {
    const { data, total } = await this.freeTourLogRepository.findAll(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return new PaginatedFreeTourLogsResponse({
      data: data.map(
        (item): FreeTourLogItemDto => ({
          id: item.id,
          sessionId: item.sessionId,
          tourId: item.tourId,
          facilityId: item.facilityId,
          actionType: item.actionType,
          actionValue: item.actionValue,
          device: item.device,
          ipAddress: this.decryptIp(item.ipAddress),
          createdAt: item.createdAt,
        })
      ),
      total,
      page,
      limit,
      totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    });
  }

  async getConsultationLogs(
    query: GetConsultationLogsRequest
  ): Promise<PaginatedConsultationLogsResponse> {
    const { data, total } = await this.consultationLogRepository.findAll(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return new PaginatedConsultationLogsResponse({
      data: data.map(
        (item): ConsultationLogItemDto => ({
          id: item.id,
          consultationId: item.consultationId,
          counselorId: item.counselorId,
          tourId: item.tourId,
          facilityId: item.facilityId,
          actionType: item.actionType,
          actionValue: item.actionValue,
          device: item.device,
          ipAddress: this.decryptIp(item.ipAddress),
          createdAt: item.createdAt,
        })
      ),
      total,
      page,
      limit,
      totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    });
  }

  async getConsultationOverview(
    request: GetConsultationOverviewRequest
  ): Promise<ConsultationOverviewResponse> {
    const timezone = request.timezone ?? 'UTC';
    const trendDays = request.trendDays ?? 7;
    const topDays = request.topDays ?? 7;
    const topLimit = request.topLimit ?? 5;

    const { start, end, dayCount } = this.resolveDateRange(
      request.startDate,
      request.endDate,
      30
    );

    const summaryRaw =
      await this.consultationStatisticsRepository.getConsultationSummary(
        start,
        end
      );

    const totalCount = Number(summaryRaw.totalCount ?? 0);
    const totalDurationSec = Number(summaryRaw.totalDurationSec ?? 0);
    const averageDurationSec = Number(summaryRaw.averageDurationSec ?? 0);
    const averageDailyCount = dayCount > 0 ? totalCount / dayCount : totalCount;

    const trendStart = this.shiftDate(end, trendDays);
    const trendRaw =
      await this.consultationStatisticsRepository.getConsultationTrend(
        trendStart,
        end,
        timezone
      );
    const trend: ConsultationTrendItemResponse[] = trendRaw.map((item) => ({
      statDate: item.statDate,
      consultationCount: Number(item.consultationCount ?? 0),
      averageDurationSec: Number(item.averageDurationSec ?? 0),
    }));

    const topSince = this.shiftDate(end, topDays);
    const topToursRaw = await this.consultationStatisticsRepository.getTopTours(
      topSince,
      topLimit
    );
    const topFacilitiesRaw =
      await this.consultationStatisticsRepository.getTopFacilities(
        topSince,
        topLimit
      );

    const topTours: TopConsultationItemResponse[] = topToursRaw.map((item) => ({
      id: item.id,
      title: item.title,
      consultationCount: Number(item.consultationCount ?? 0),
      totalDurationSec: Number(item.totalDurationSec ?? 0),
    }));

    const topFacilities: TopConsultationItemResponse[] = topFacilitiesRaw.map(
      (item) => ({
        id: item.id,
        title: item.title,
        consultationCount: Number(item.consultationCount ?? 0),
        totalDurationSec: Number(item.totalDurationSec ?? 0),
      })
    );

    const summary: ConsultationSummaryResponse = {
      totalCount,
      averageDailyCount,
      totalDurationSec,
      averageDurationSec,
    };

    return {
      summary,
      trend,
      topTours,
      topFacilities,
    };
  }

  async getTourStatistics(
    request: GetTourStatisticsRequest
  ): Promise<TourStatisticsResponse> {
    const timezone = request.timezone ?? 'UTC';
    const tourIds = (request.tourIds ?? []).filter((id) => id);

    if (tourIds.length === 0) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_TOUR_IDS,
        HttpStatus.BAD_REQUEST
      );
    }

    const { start, end } = this.resolveDateRange(
      request.startDate,
      request.endDate,
      30
    );

    const trendRaw = await this.consultationStatisticsRepository.getTourTrend(
      start,
      end,
      timezone,
      tourIds
    );
    const trend: TourTrendItemResponse[] = trendRaw.map((item) => ({
      tourId: item.tourId,
      tourTitle: item.tourTitle,
      statDate: item.statDate,
      consultationCount: Number(item.consultationCount ?? 0),
    }));

    const aggregatesRaw =
      await this.consultationStatisticsRepository.getTourAggregates(
        start,
        end,
        tourIds
      );

    const items: TourAggregateItemResponse[] = aggregatesRaw.map((item) => ({
      tourId: item.tourId,
      tourTitle: item.tourTitle,
      consultationCount: Number(item.consultationCount ?? 0),
      totalDurationSec: Number(item.totalDurationSec ?? 0),
      averageDurationSec: Number(item.averageDurationSec ?? 0),
    }));

    const totalCount = items.reduce(
      (acc, curr) => acc + curr.consultationCount,
      0
    );
    const totalDurationSec = items.reduce(
      (acc, curr) => acc + curr.totalDurationSec,
      0
    );
    const totalAverageDurationSec = totalCount
      ? totalDurationSec / totalCount
      : 0;

    const total: TourStatisticsTotalResponse = {
      consultationCount: totalCount,
      totalDurationSec,
      averageDurationSec: totalAverageDurationSec,
    };

    return {
      trend,
      items,
      total,
    };
  }

  async getFacilityStatistics(
    request: GetFacilityStatisticsRequest
  ): Promise<FacilityStatisticsResponse> {
    const facilityIds = (request.facilityIds ?? []).filter((id) => id);

    if (facilityIds.length === 0) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_FACILITY_IDS,
        HttpStatus.BAD_REQUEST
      );
    }

    const { start, end } = this.resolveDateRange(
      request.startDate,
      request.endDate,
      30
    );

    const aggregatesRaw =
      await this.consultationStatisticsRepository.getFacilityAggregates(
        start,
        end,
        facilityIds
      );

    const items: FacilityAggregateItemResponse[] = aggregatesRaw.map(
      (item) => ({
        facilityId: item.facilityId,
        facilityTitle: item.facilityTitle,
        consultationCount: Number(item.consultationCount ?? 0),
        totalDurationSec: Number(item.totalDurationSec ?? 0),
        averageDurationSec: Number(item.averageDurationSec ?? 0),
      })
    );

    const totalCount = items.reduce(
      (acc, curr) => acc + curr.consultationCount,
      0
    );
    const totalDurationSec = items.reduce(
      (acc, curr) => acc + curr.totalDurationSec,
      0
    );
    const totalAverageDurationSec = totalCount
      ? totalDurationSec / totalCount
      : 0;

    const total: FacilityStatisticsTotalResponse = {
      consultationCount: totalCount,
      totalDurationSec,
      averageDurationSec: totalAverageDurationSec,
    };

    return {
      items,
      total,
    };
  }

  async getDashboardStatistics(
    request: GetDashboardStatisticsRequest
  ): Promise<DashboardStatisticsResponse> {
    const filter = this.normalizeStatsFilter(request);
    const top = request.top ?? 5;

    const tourDaily = await this.fetchTourDailyStats(filter);
    const facilityDaily = await this.fetchFacilityDailyStats(filter);

    const summary = this.buildSummary(tourDaily);
    const trend = this.buildTrend(tourDaily);

    const tourTotals = this.buildTourTotals(tourDaily)
      .sort((a, b) => b.consultationsCount - a.consultationsCount)
      .slice(0, top);
    const tourTitles = await this.loadTourTitles(
      tourTotals.map((item) => item.tourId)
    );
    const topTours: TourAggregateStatDto[] = tourTotals.map((item) => ({
      tourId: item.tourId,
      tourTitle: tourTitles[item.tourId] ?? '',
      consultationsCount: item.consultationsCount,
      totalSeconds: item.totalSeconds,
      avgSeconds: item.avgSeconds,
    }));

    const facilityTotals = this.buildFacilityTotals(facilityDaily)
      .sort((a, b) => b.consultationsCount - a.consultationsCount)
      .slice(0, top);
    const facilityMeta = await this.loadFacilityMeta(
      facilityTotals.map((item) => item.tourFacilityId)
    );
    const topFacilities: FacilityAggregateStatDto[] = facilityTotals.map(
      (item) => {
        const meta = facilityMeta[item.tourFacilityId];
        return {
          tourFacilityId: item.tourFacilityId,
          tourId: item.tourId,
          facilityId: item.facilityId,
          tourTitle: meta?.tourTitle ?? '',
          facilityTitle: meta?.facilityTitle ?? '',
          consultationsCount: item.consultationsCount,
          totalSeconds: item.totalSeconds,
          avgSeconds: item.avgSeconds,
        };
      }
    );

    return {
      summary,
      trend,
      topTours,
      topFacilities,
    };
  }

  async getDashboardSummary(
    request: StatsFilterDto
  ): Promise<DashboardSummaryResponse> {
    const filter = this.normalizeStatsFilter(request);
    const trendRows = await this.fetchTourDailyStats(filter);
    return {
      summary: this.buildSummary(trendRows),
    };
  }

  async getDashboardTrend(
    request: StatsFilterDto
  ): Promise<DashboardTrendResponse> {
    const filter = this.normalizeStatsFilter(request);
    const trendRows = await this.fetchTourDailyStats(filter);
    return {
      trend: this.buildTrend(trendRows),
    };
  }

  async getDashboardTopTours(
    request: GetDashboardStatisticsRequest
  ): Promise<DashboardTopToursResponse> {
    const filter = this.normalizeStatsFilter(request);
    const topLimit = request.top ?? 5;

    const tourRows = await this.fetchTourDailyStats(filter);
    const totals = this.buildTourTotals(tourRows)
      .sort((a, b) => b.consultationsCount - a.consultationsCount)
      .slice(0, topLimit);

    const titles = await this.loadTourTitles(totals.map((item) => item.tourId));

    return {
      topTours: totals.map((item) => ({
        ...item,
        tourTitle: titles[item.tourId] ?? '',
      })),
    };
  }

  async getDashboardTopFacilities(
    request: GetDashboardStatisticsRequest
  ): Promise<DashboardTopFacilitiesResponse> {
    const filter = this.normalizeStatsFilter(request);
    const topLimit = request.top ?? 5;

    const facilityRows = await this.fetchFacilityDailyStats(filter);
    const totals = this.buildFacilityTotals(facilityRows)
      .sort((a, b) => b.consultationsCount - a.consultationsCount)
      .slice(0, topLimit);

    const targetIds = totals.map((item) => item.tourFacilityId);
    const facilityMeta = await this.loadFacilityMeta(targetIds);

    return {
      topFacilities: totals.map((item) => ({
        ...item,
        tourTitle: facilityMeta[item.tourFacilityId]?.tourTitle ?? '',
        facilityTitle: facilityMeta[item.tourFacilityId]?.facilityTitle ?? '',
      })),
    };
  }

  async getTourStatisticsV2(
    request: GetTourStatisticsV2Request
  ): Promise<TourStatisticsV2Response> {
    const filter = this.normalizeStatsFilter(request);
    const top = request.top ?? 5;

    const tourDaily = await this.fetchTourDailyStats(filter);
    if (tourDaily.length === 0) {
      return { totals: [], trend: [], overall: this.emptySummary() };
    }

    const totalsByTour = this.buildTourTotals(tourDaily);
    const targetIds = Array.from(
      new Set(
        filter.tourIds?.length && filter.tourIds.length > 0
          ? filter.tourIds
          : totalsByTour
              .sort((a, b) => b.consultationsCount - a.consultationsCount)
              .slice(0, top)
              .map((item) => item.tourId)
      )
    );

    const titles = await this.loadTourTitles(targetIds);
    const filteredTotals = totalsByTour
      .filter((item) => targetIds.includes(item.tourId))
      .map((item) => ({
        ...item,
        tourTitle: titles[item.tourId] ?? '',
      }));

    const trend: TourDailyStatDto[] = tourDaily
      .filter((item) => targetIds.includes(item.tourId))
      .map((item) => ({
        tourId: item.tourId,
        tourTitle: titles[item.tourId] ?? '',
        statDate: item.statDate,
        consultationsCount: item.consultationsCount,
        totalSeconds: item.totalSeconds,
        avgSeconds: item.avgSeconds,
      }))
      .sort((a, b) => a.statDate.localeCompare(b.statDate));

    const overall = this.buildSummaryFromTotals(filteredTotals);

    return {
      totals: filteredTotals,
      trend,
      overall,
    };
  }

  async getFacilityStatisticsV2(
    request: GetFacilityStatisticsV2Request
  ): Promise<FacilityStatisticsV2Response> {
    const filter = this.normalizeStatsFilter(request);
    const top = request.top ?? 5;

    const facilityDaily = await this.fetchFacilityDailyStats(filter);
    if (facilityDaily.length === 0) {
      return { totals: [], trend: [], overall: this.emptySummary() };
    }

    const totalsByFacility = this.buildFacilityTotals(facilityDaily);
    const requestedFacilities = filter.facilityIds?.map(String) ?? [];
    const targetIds =
      requestedFacilities.length > 0
        ? totalsByFacility
            .filter(
              (item) =>
                requestedFacilities.includes(item.facilityId) ||
                requestedFacilities.includes(item.tourFacilityId)
            )
            .map((item) => item.tourFacilityId)
        : totalsByFacility
            .sort((a, b) => b.consultationsCount - a.consultationsCount)
            .slice(0, top)
            .map((item) => item.tourFacilityId);

    const targetIdsUnique = Array.from(new Set(targetIds));

    const facilityMeta = await this.loadFacilityMeta(targetIdsUnique);

    const filteredTotals: FacilityAggregateStatDto[] = totalsByFacility
      .filter((item) => targetIdsUnique.includes(item.tourFacilityId))
      .map((item) => {
        const meta = facilityMeta[item.tourFacilityId];
        return {
          tourFacilityId: item.tourFacilityId,
          tourId: item.tourId,
          facilityId: item.facilityId,
          facilityTitle: meta?.facilityTitle ?? '',
          tourTitle: meta?.tourTitle ?? '',
          consultationsCount: item.consultationsCount,
          totalSeconds: item.totalSeconds,
          avgSeconds: item.avgSeconds,
        };
      });

    const trend: FacilityDailyStatDto[] = facilityDaily
      .filter((item) => targetIdsUnique.includes(item.tourFacilityId))
      .map((item) => {
        const meta = facilityMeta[item.tourFacilityId];
        return {
          tourFacilityId: item.tourFacilityId,
          tourId: item.tourId,
          facilityId: item.facilityId,
          facilityTitle: meta?.facilityTitle ?? '',
          statDate: item.statDate,
          consultationsCount: item.consultationsCount,
          totalSeconds: item.totalSeconds,
          avgSeconds: item.avgSeconds,
        };
      })
      .sort((a, b) => a.statDate.localeCompare(b.statDate));

    const overall = this.buildSummaryFromFacilityTotals(filteredTotals);

    return {
      totals: filteredTotals,
      trend,
      overall,
    };
  }

  async getConsultationSessions(
    request: GetConsultationSessionsRequest
  ): Promise<PaginatedConsultationSessionsResponse> {
    const filter = this.normalizeStatsFilter(request);
    const page = request.page ?? 1;
    const limit = request.limit ?? 20;
    const order = request.order ?? 'DESC';

    const { data, total } =
      await this.consultationStatisticsV2Repository.getSessionList(
        filter,
        (page - 1) * limit,
        limit,
        order
      );

    const tourTitles = await this.loadTourTitles(
      data
        .map((item) => item.tourKey)
        .filter((id): id is string => !!id)
        .map(String)
    );

    const facilityMeta = await this.loadFacilityMetaFromSessions(data);

    const sessions: ConsultationSessionItemResponse[] = data.map((item) => {
      const meta = this.resolveFacilityMeta(
        facilityMeta,
        item.tourKey,
        item.facilityKey
      );

      return {
        consultationId: item.consultationId,
        tourId: item.tourKey ?? null,
        tourTitle: item.tourKey ? (tourTitles[item.tourKey] ?? '') : '',
        tourFacilityId: meta?.tourFacilityId ?? null,
        facilityId: meta?.facilityId ?? item.facilityKey ?? null,
        facilityTitle: meta?.facilityTitle ?? '',
        consultantId: item.consultantId ?? null,
        startedAt: item.startedAt,
        endedAt: item.endedAt,
        durationSeconds: Number(item.durationSeconds ?? 0),
        statDate: item.statDate,
      };
    });

    return {
      data: sessions,
      total,
      page,
      limit,
      totalPages: limit ? Math.max(1, Math.ceil(total / limit)) : 1,
    };
  }

  private normalizeStatsFilter(dto: StatsFilterDto): StatsFilter {
    const start = this.parseDate(dto.startDate);
    const end = this.parseDate(dto.endDate);

    if (start > end) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST
      );
    }

    const yesterday = new Date();
    yesterday.setUTCHours(0, 0, 0, 0);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);

    if (start > yesterday || end > yesterday) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST,
        'startDate/endDate는 어제(UTC) 이전까지만 지정할 수 있습니다.'
      );
    }

    return {
      startDate: dto.startDate,
      endDate: dto.endDate,
      tourIds: dto.tourIds?.map((id) => id.toString()).filter(Boolean),
      facilityIds: dto.facilityIds?.map((id) => id.toString()).filter(Boolean),
      consultantIds: dto.consultantIds
        ?.map((id) => id.toString())
        .filter(Boolean),
    };
  }

  private parseDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST
      );
    }
    return date;
  }

  private async fetchTourDailyStats(
    filter: StatsFilter
  ): Promise<TourStatsDailyEntity[]> {
    const records = filter.consultantIds?.length
      ? await this.consultationStatisticsV2Repository.getTourStatsFromSessions(
          filter
        )
      : await this.consultationStatisticsV2Repository.getTourStats(filter);

    if (records.length > 0) {
      return records;
    }

    // 집계 테이블이 비어있을 때를 대비한 보정 (로그 기반 on-the-fly)
    return this.consultationStatisticsV2Repository.getTourStatsFromSessions(
      filter
    );
  }

  private async fetchFacilityDailyStats(
    filter: StatsFilter
  ): Promise<TourFacilityStatsDailyEntity[]> {
    const records = filter.consultantIds?.length
      ? await this.consultationStatisticsV2Repository.getFacilityStatsFromSessions(
          filter
        )
      : await this.consultationStatisticsV2Repository.getFacilityStats(filter);

    if (records.length > 0) {
      return records;
    }

    return this.consultationStatisticsV2Repository.getFacilityStatsFromSessions(
      filter
    );
  }

  private buildSummary(rows: TourStatsDailyEntity[]): DashboardSummaryDto {
    const totalConsultations = rows.reduce(
      (sum, row) => sum + row.consultationsCount,
      0
    );
    const totalSeconds = rows.reduce((sum, row) => sum + row.totalSeconds, 0);
    const avgSeconds = totalConsultations
      ? totalSeconds / totalConsultations
      : 0;

    return {
      totalConsultations,
      totalSeconds,
      avgSeconds,
    };
  }

  private buildTrend(rows: TourStatsDailyEntity[]): DashboardTrendItemDto[] {
    const grouped = new Map<
      string,
      { consultationsCount: number; totalSeconds: number }
    >();

    rows.forEach((row) => {
      const target = grouped.get(row.statDate) ?? {
        consultationsCount: 0,
        totalSeconds: 0,
      };
      target.consultationsCount += row.consultationsCount;
      target.totalSeconds += row.totalSeconds;
      grouped.set(row.statDate, target);
    });

    return Array.from(grouped.entries())
      .map(([statDate, value]) => {
        const avgSeconds = value.consultationsCount
          ? value.totalSeconds / value.consultationsCount
          : 0;
        return {
          statDate,
          consultationsCount: value.consultationsCount,
          totalSeconds: value.totalSeconds,
          avgSeconds,
        };
      })
      .sort((a, b) => a.statDate.localeCompare(b.statDate));
  }

  private buildTourTotals(rows: TourStatsDailyEntity[]): Array<{
    tourId: string;
    consultationsCount: number;
    totalSeconds: number;
    avgSeconds: number;
  }> {
    const grouped = new Map<
      string,
      { consultationsCount: number; totalSeconds: number }
    >();

    rows.forEach((row) => {
      if (!row.tourId) {
        return;
      }
      const target = grouped.get(row.tourId) ?? {
        consultationsCount: 0,
        totalSeconds: 0,
      };
      target.consultationsCount += row.consultationsCount;
      target.totalSeconds += row.totalSeconds;
      grouped.set(row.tourId, target);
    });

    return Array.from(grouped.entries()).map(([tourId, value]) => ({
      tourId,
      consultationsCount: value.consultationsCount,
      totalSeconds: value.totalSeconds,
      avgSeconds: value.consultationsCount
        ? value.totalSeconds / value.consultationsCount
        : 0,
    }));
  }

  private buildFacilityTotals(rows: TourFacilityStatsDailyEntity[]): Array<{
    tourFacilityId: string;
    tourId: string;
    facilityId: string;
    consultationsCount: number;
    totalSeconds: number;
    avgSeconds: number;
  }> {
    const grouped = new Map<
      string,
      {
        tourId: string;
        facilityId: string;
        consultationsCount: number;
        totalSeconds: number;
      }
    >();

    rows.forEach((row) => {
      if (!row.tourFacilityId) {
        return;
      }
      const target = grouped.get(row.tourFacilityId) ?? {
        tourId: row.tourId,
        facilityId: row.facilityId,
        consultationsCount: 0,
        totalSeconds: 0,
      };
      target.consultationsCount += row.consultationsCount;
      target.totalSeconds += row.totalSeconds;
      grouped.set(row.tourFacilityId, target);
    });

    return Array.from(grouped.entries()).map(([tourFacilityId, value]) => ({
      tourFacilityId,
      tourId: value.tourId,
      facilityId: value.facilityId,
      consultationsCount: value.consultationsCount,
      totalSeconds: value.totalSeconds,
      avgSeconds: value.consultationsCount
        ? value.totalSeconds / value.consultationsCount
        : 0,
    }));
  }

  private buildSummaryFromTotals(
    totals: Array<{ consultationsCount: number; totalSeconds: number }>
  ): DashboardSummaryDto {
    const totalConsultations = totals.reduce(
      (sum, item) => sum + item.consultationsCount,
      0
    );
    const totalSeconds = totals.reduce(
      (sum, item) => sum + item.totalSeconds,
      0
    );

    return {
      totalConsultations,
      totalSeconds,
      avgSeconds: totalConsultations ? totalSeconds / totalConsultations : 0,
    };
  }

  private buildSummaryFromFacilityTotals(
    totals: Array<{ consultationsCount: number; totalSeconds: number }>
  ): DashboardSummaryDto {
    return this.buildSummaryFromTotals(totals);
  }

  private emptySummary(): DashboardSummaryDto {
    return {
      totalConsultations: 0,
      totalSeconds: 0,
      avgSeconds: 0,
    };
  }

  private async loadTourTitles(
    tourIds: string[]
  ): Promise<Record<string, string>> {
    const uniqueIds = Array.from(new Set(tourIds)).filter(Boolean);
    if (uniqueIds.length === 0) {
      return {};
    }

    const tours = await this.dataSource
      .getRepository(TourEntity)
      .findBy({ id: In(uniqueIds) });

    return tours.reduce<Record<string, string>>((acc, tour) => {
      acc[tour.id] = tour.title;
      return acc;
    }, {});
  }

  private async loadFacilityMeta(tourFacilityIds: string[]): Promise<
    Record<
      string,
      {
        tourFacilityId: string;
        tourId: string;
        facilityId: string;
        tourTitle: string;
        facilityTitle: string;
      }
    >
  > {
    const uniqueIds = Array.from(new Set(tourFacilityIds)).filter(Boolean);
    if (uniqueIds.length === 0) {
      return {};
    }

    const facilities = await this.dataSource
      .getRepository(TourFacilityEntity)
      .find({
        where: { id: In(uniqueIds) },
        relations: ['facility', 'tour'],
      });

    return facilities.reduce<
      Record<
        string,
        {
          tourFacilityId: string;
          tourId: string;
          facilityId: string;
          tourTitle: string;
          facilityTitle: string;
        }
      >
    >((acc, item) => {
      acc[item.id] = {
        tourFacilityId: item.id,
        tourId: item.tourId,
        facilityId: item.facilityId,
        tourTitle: item.tour?.title ?? '',
        facilityTitle: item.facility?.title ?? '',
      };
      return acc;
    }, {});
  }

  private async loadFacilityMetaFromSessions(
    sessions: SessionViewRow[]
  ): Promise<TourFacilityEntity[]> {
    const tourIds = Array.from(
      new Set(
        sessions.map((item) => item.tourKey).filter((id): id is string => !!id)
      )
    );
    const facilityKeys = Array.from(
      new Set(
        sessions
          .map((item) => item.facilityKey)
          .filter((id): id is string => !!id)
      )
    );

    if (tourIds.length === 0 || facilityKeys.length === 0) {
      return [];
    }

    return this.dataSource
      .getRepository(TourFacilityEntity)
      .createQueryBuilder('tf')
      .leftJoinAndSelect('tf.tour', 'tour')
      .leftJoinAndSelect('tf.facility', 'facility')
      .where('tf.tourId IN (:...tourIds)', { tourIds })
      .andWhere(
        '(tf.id IN (:...facilityKeys) OR tf.facilityId IN (:...facilityKeys) OR tf.sceneId IN (:...facilityKeys))',
        { facilityKeys }
      )
      .getMany();
  }

  private resolveFacilityMeta(
    facilities: TourFacilityEntity[],
    tourKey?: string | null,
    facilityKey?: string | null
  ):
    | {
        tourFacilityId: string;
        tourId: string;
        facilityId: string;
        facilityTitle: string;
        tourTitle: string;
      }
    | undefined {
    if (!tourKey || !facilityKey) {
      return undefined;
    }

    const matched = facilities.find(
      (item) =>
        item.tourId?.toString() === tourKey &&
        (item.id?.toString() === facilityKey ||
          item.facilityId?.toString() === facilityKey ||
          item.sceneId?.toString() === facilityKey)
    );

    if (!matched) {
      return undefined;
    }

    return {
      tourFacilityId: matched.id,
      tourId: matched.tourId,
      facilityId: matched.facilityId,
      facilityTitle: matched.facility?.title ?? '',
      tourTitle: matched.tour?.title ?? '',
    };
  }

  async createAdminLog(
    request: CreateAdminLogRequest
  ): Promise<CreateLogResponse> {
    const savedLog = await this.dataSource.transaction(async (manager) => {
      const ipAddress = this.toEncryptedIpOrNull(request.ipAddress);
      const adminLog = new AdminLogEntity();
      adminLog.actionType = request.actionType;
      adminLog.actionValue = request.actionValue;
      adminLog.counselorId = request.counselorId;
      adminLog.device = request.device;
      adminLog.ipAddress = ipAddress;
      adminLog.createdAt = new Date();

      return this.adminLogRepository.create(adminLog, manager);
    });

    return {
      id: savedLog.id.toString(),
      success: true,
      createdAt: savedLog.createdAt,
      message: '관리자 활동 로그가 성공적으로 생성되었습니다.',
    };
  }

  async createLoginLog(
    request: CreateLoginLogRequest
  ): Promise<CreateLogResponse> {
    const savedLog = await this.dataSource.transaction(async (manager) => {
      const ipAddress = this.toEncryptedIpOrNull(request.ipAddress);
      const loginLog = new LoginLogEntity();
      loginLog.actionType = request.actionType;
      loginLog.actionValue = request.actionValue;
      loginLog.counselorId = request.counselorId;
      loginLog.device = request.device;
      loginLog.ipAddress = ipAddress;
      loginLog.createdAt = new Date();

      return this.loginLogRepository.create(loginLog, manager);
    });

    return {
      id: savedLog.id.toString(),
      success: true,
      createdAt: savedLog.createdAt,
      message: '로그인 활동 로그가 성공적으로 생성되었습니다.',
    };
  }

  async createFreeTourLog(
    request: CreateFreeTourLogRequest
  ): Promise<CreateLogResponse> {
    const savedLog = await this.dataSource.transaction(async (manager) => {
      const ipAddress = this.toEncryptedIpOrNull(request.ipAddress);
      const freeTourLog = new FreeTourLogEntity();
      freeTourLog.actionType = request.actionType;
      freeTourLog.actionValue = request.actionValue;
      freeTourLog.sessionId = request.sessionId;
      freeTourLog.tourId = request.tourId;
      freeTourLog.facilityId = request.facilityId;
      freeTourLog.device = request.device;
      freeTourLog.ipAddress = ipAddress;
      freeTourLog.createdAt = new Date();

      return this.freeTourLogRepository.create(freeTourLog, manager);
    });

    return {
      id: savedLog.id.toString(),
      success: true,
      createdAt: savedLog.createdAt,
      message: '자가점검 활동 로그가 성공적으로 생성되었습니다.',
    };
  }

  async createConsultationLog(
    request: CreateConsultationLogRequest
  ): Promise<CreateLogResponse> {
    const savedLog = await this.dataSource.transaction(async (manager) => {
      const ipAddress = this.toEncryptedIpOrNull(request.ipAddress);
      const consultationLog = new ConsultationLogEntity();
      consultationLog.actionType = request.actionType;
      consultationLog.actionValue = request.actionValue;
      consultationLog.consultationId = request.consultationId;
      consultationLog.counselorId = request.counselorId;
      consultationLog.tourId = request.tourId;
      consultationLog.facilityId = request.facilityId;
      consultationLog.device = request.device;
      consultationLog.ipAddress = ipAddress;
      consultationLog.createdAt = new Date();

      return this.consultationLogRepository.create(consultationLog, manager);
    });

    return {
      id: savedLog.id.toString(),
      success: true,
      createdAt: savedLog.createdAt,
      message: '상담실 활동 로그가 성공적으로 생성되었습니다.',
    };
  }

  private toEncryptedIpOrNull(ipAddress?: string | null): string | null {
    const encrypted = this.ipEncryptionService.encrypt(ipAddress);
    return encrypted ?? null;
  }

  private buildEncryptedSearchCandidates(
    ipAddress?: string | null
  ): string[] | undefined {
    const normalized = normalizeIp(ipAddress);
    const encrypted = this.ipEncryptionService.encrypt(normalized ?? ipAddress);
    if (!encrypted) {
      return undefined;
    }

    return [encrypted];
  }

  private decryptIp(ipAddress?: string | null): string | null {
    const decrypted = this.ipEncryptionService.decrypt(ipAddress);
    return decrypted ?? null;
  }

  private resolveDateRange(
    start?: string,
    end?: string,
    defaultDays = 30
  ): { start: Date; end: Date; dayCount: number } {
    const endDate = end ? new Date(end) : new Date();
    const startDate = start
      ? new Date(start)
      : new Date(endDate.getTime() - defaultDays * 24 * 60 * 60 * 1000);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new CustomException(
        StatisticsErrorCode.STATISTICS_INVALID_DATE_RANGE,
        HttpStatus.BAD_REQUEST
      );
    }

    const [normalizedStart, normalizedEnd] = normalizeDateRange(
      startDate,
      endDate
    );

    const startOfDay = this.startOfDay(normalizedStart);
    const endOfDay = this.endOfDay(normalizedEnd);

    const dayCount = this.calculateIncludedDays(startOfDay, endOfDay);

    return {
      start: startOfDay,
      end: endOfDay,
      dayCount,
    };
  }

  private calculateIncludedDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.floor(diff / (24 * 60 * 60 * 1000)) + 1);
  }

  private shiftDate(base: Date, days: number): Date {
    const target = new Date(base);
    target.setUTCDate(target.getUTCDate() - Math.max(0, days - 1));
    return this.startOfDay(target);
  }

  private startOfDay(date: Date): Date {
    const value = new Date(date);
    value.setUTCHours(0, 0, 0, 0);
    return value;
  }

  private endOfDay(date: Date): Date {
    const value = new Date(date);
    value.setUTCHours(23, 59, 59, 999);
    return value;
  }
}
