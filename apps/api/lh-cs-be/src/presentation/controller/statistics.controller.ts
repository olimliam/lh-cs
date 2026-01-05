import { StatisticsService } from '@/application/service/statistics.service';
import { Roles } from '@/common/decorator/roles.decorator';
import { JwtAuthGuard } from '@/common/guard/jwt-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { UserRoleEnum } from '@/infrastructure/repository/entity';
import { CreateAdminLogRequest } from '@/presentation/dto/request/create-admin-log.request';
import { CreateConsultationLogRequest } from '@/presentation/dto/request/create-consultation-log.request';
import { CreateFreeTourLogRequest } from '@/presentation/dto/request/create-free-tour-log.request';
import { GetAdminLogsRequest } from '@/presentation/dto/request/get-admin-logs.request';
import { GetConsultationLogsRequest } from '@/presentation/dto/request/get-consultation-logs.request';
import { GetConsultationOverviewRequest } from '@/presentation/dto/request/get-consultation-overview.request';
import { GetFacilityStatisticsRequest } from '@/presentation/dto/request/get-facility-statistics.request';
import { GetFreeTourLogsRequest } from '@/presentation/dto/request/get-free-tour-logs.request';
import { GetTourStatisticsRequest } from '@/presentation/dto/request/get-tour-statistics.request';
import { GetDashboardStatisticsRequest } from '@/presentation/dto/request/get-dashboard-statistics.request';
import { GetTourStatisticsV2Request } from '@/presentation/dto/request/get-tour-statistics-v2.request';
import { GetFacilityStatisticsV2Request } from '@/presentation/dto/request/get-facility-statistics-v2.request';
import { GetConsultationSessionsRequest } from '@/presentation/dto/request/get-consultation-sessions.request';
import { StatsFilterDto } from '@/presentation/dto/request/stats-filter.dto';
import {
  ConsultationOverviewResponse,
  FacilityStatisticsResponse,
  TourStatisticsResponse,
} from '@/presentation/dto/response/consultation-statistics.response';
import {
  DashboardStatisticsResponse,
  DashboardSummaryResponse,
  DashboardTrendResponse,
  DashboardTopFacilitiesResponse,
  DashboardTopToursResponse,
} from '@/presentation/dto/response/dashboard-statistics.response';
import {
  FacilityStatisticsV2Response,
  TourStatisticsV2Response,
} from '@/presentation/dto/response/tour-facility-statistics.response';
import { CreateLogResponse } from '@/presentation/dto/response/create-log.response';
import {
  PaginatedAdminLogsResponse,
  PaginatedConsultationLogsResponse,
  PaginatedFreeTourLogsResponse,
  PaginatedLoginLogsResponse,
} from '@/presentation/dto/response/logs.response';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { PaginatedConsultationSessionsResponse } from '../dto/response';

@ApiTags('통계 로그 관리')
@Controller('statistics')
@ApiExtraModels(
  PaginatedAdminLogsResponse,
  PaginatedLoginLogsResponse,
  PaginatedFreeTourLogsResponse,
  PaginatedConsultationLogsResponse,
  CreateLogResponse,
  ConsultationOverviewResponse,
  TourStatisticsResponse,
  FacilityStatisticsResponse,
  DashboardStatisticsResponse,
  DashboardSummaryResponse,
  DashboardTrendResponse,
  DashboardTopToursResponse,
  DashboardTopFacilitiesResponse,
  TourStatisticsV2Response,
  FacilityStatisticsV2Response,
  PaginatedConsultationSessionsResponse
)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '대시보드 요약 카드' })
  @ApiResponse({
    status: 200,
    description: '총 상담 건수/총 시간/평균 시간 반환',
    schema: { $ref: getSchemaPath(DashboardSummaryResponse) },
  })
  async getDashboardSummary(
    @Query() query: StatsFilterDto
  ): Promise<DashboardSummaryResponse> {
    return this.statisticsService.getDashboardSummary(query);
  }

  @Get('dashboard/trend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '대시보드 전체 상담 추이' })
  @ApiResponse({
    status: 200,
    description: 'statDate 기준 전체 상담 건수/시간을 일자별로 반환',
    schema: { $ref: getSchemaPath(DashboardTrendResponse) },
  })
  async getDashboardTrend(
    @Query() query: StatsFilterDto
  ): Promise<DashboardTrendResponse> {
    return this.statisticsService.getDashboardTrend(query);
  }

  @Get('dashboard/top-tours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Top 투어(평형) 목록' })
  @ApiResponse({
    status: 200,
    description: 'Top N 평형 랭킹',
    schema: { $ref: getSchemaPath(DashboardTopToursResponse) },
  })
  async getDashboardTopTours(
    @Query() query: GetDashboardStatisticsRequest
  ): Promise<DashboardTopToursResponse> {
    return this.statisticsService.getDashboardTopTours(query);
  }

  @Get('dashboard/top-facilities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Top 시설(투어 시설) 목록' })
  @ApiResponse({
    status: 200,
    description: 'Top N 시설 랭킹',
    schema: { $ref: getSchemaPath(DashboardTopFacilitiesResponse) },
  })
  async getDashboardTopFacilities(
    @Query() query: GetDashboardStatisticsRequest
  ): Promise<DashboardTopFacilitiesResponse> {
    return this.statisticsService.getDashboardTopFacilities(query);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '대시보드 통계 조회 (집계 테이블 기반)' })
  @ApiResponse({
    status: 200,
    description: '대시보드 통계 조회 성공',
    schema: { $ref: getSchemaPath(DashboardStatisticsResponse) },
  })
  async getDashboardStatistics(
    @Query() query: GetDashboardStatisticsRequest
  ): Promise<DashboardStatisticsResponse> {
    return this.statisticsService.getDashboardStatistics(query);
  }

  @Get('tours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '평형(투어) 통계 조회 (집계 테이블 기반)' })
  @ApiResponse({
    status: 200,
    description: '평형 통계 조회 성공',
    schema: { $ref: getSchemaPath(TourStatisticsV2Response) },
  })
  async getTourStatisticsV2(
    @Query() query: GetTourStatisticsV2Request
  ): Promise<TourStatisticsV2Response> {
    return this.statisticsService.getTourStatisticsV2(query);
  }

  @Get('facilities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary: '시설(투어 시설/Scene) 통계 조회 (집계 테이블 기반)',
  })
  @ApiResponse({
    status: 200,
    description: '시설 통계 조회 성공',
    schema: { $ref: getSchemaPath(FacilityStatisticsV2Response) },
  })
  async getFacilityStatisticsV2(
    @Query() query: GetFacilityStatisticsV2Request
  ): Promise<FacilityStatisticsV2Response> {
    return this.statisticsService.getFacilityStatisticsV2(query);
  }

  @Get('consultations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '상담 세션 목록/상세 조회 (정규화 세션 뷰)' })
  @ApiResponse({
    status: 200,
    description: '상담 세션 조회 성공',
    schema: { $ref: getSchemaPath(PaginatedConsultationSessionsResponse) },
  })
  async getConsultationSessions(
    @Query() query: GetConsultationSessionsRequest
  ): Promise<PaginatedConsultationSessionsResponse> {
    return this.statisticsService.getConsultationSessions(query);
  }

  @Get('consultations/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '상담 요약 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '상담 통계 조회 성공',
    schema: { $ref: getSchemaPath(ConsultationOverviewResponse) },
  })
  async getConsultationOverview(
    @Query() query: GetConsultationOverviewRequest
  ): Promise<ConsultationOverviewResponse> {
    return this.statisticsService.getConsultationOverview(query);
  }

  @Get('consultations/tours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '평형별 상담 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '평형 통계 조회 성공',
    schema: { $ref: getSchemaPath(TourStatisticsResponse) },
  })
  async getTourStatistics(
    @Query() query: GetTourStatisticsRequest
  ): Promise<TourStatisticsResponse> {
    return this.statisticsService.getTourStatistics(query);
  }

  @Get('consultations/facilities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '시설별 상담 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '시설 통계 조회 성공',
    schema: { $ref: getSchemaPath(FacilityStatisticsResponse) },
  })
  async getFacilityStatistics(
    @Query() query: GetFacilityStatisticsRequest
  ): Promise<FacilityStatisticsResponse> {
    return this.statisticsService.getFacilityStatistics(query);
  }

  @Get('user-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '사용자 활동 로그 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 활동 로그 조회 성공',
    schema: { $ref: getSchemaPath(PaginatedAdminLogsResponse) },
  })
  async getAdminLogs(
    @Query() query: GetAdminLogsRequest
  ): Promise<PaginatedAdminLogsResponse> {
    return this.statisticsService.getAdminLogs(query);
  }

  @Get('free-tour-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '자가점검(프리투어) 로그 조회' })
  @ApiResponse({
    status: 200,
    description: '자가점검 로그 조회 성공',
    schema: { $ref: getSchemaPath(PaginatedFreeTourLogsResponse) },
  })
  async getFreeTourLogs(
    @Query() query: GetFreeTourLogsRequest
  ): Promise<PaginatedFreeTourLogsResponse> {
    return this.statisticsService.getFreeTourLogs(query);
  }

  @Get('consultation-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '상담실 활동 로그 조회' })
  @ApiResponse({
    status: 200,
    description: '상담실 활동 로그 조회 성공',
    schema: { $ref: getSchemaPath(PaginatedConsultationLogsResponse) },
  })
  async getConsultationLogs(
    @Query() query: GetConsultationLogsRequest
  ): Promise<PaginatedConsultationLogsResponse> {
    return this.statisticsService.getConsultationLogs(query);
  }

  @Post('user-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '사용자 활동 로그 생성' })
  @ApiResponse({
    status: 201,
    description: '사용자 활동 로그 생성 성공',
    schema: { $ref: getSchemaPath(CreateLogResponse) },
  })
  async createAdminLog(
    @Body() request: CreateAdminLogRequest
  ): Promise<CreateLogResponse> {
    return this.statisticsService.createAdminLog(request);
  }

  @Post('consultation-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRoleEnum.ADMIN,
    UserRoleEnum.CONSULTANT,
    UserRoleEnum.SUPER_ADMIN,
    UserRoleEnum.USER
  )
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: '상담실 활동 로그 생성' })
  @ApiResponse({
    status: 201,
    description: '상담실 활동 로그 생성 성공',
    schema: { $ref: getSchemaPath(CreateLogResponse) },
  })
  async createConsultationLog(
    @Body() request: CreateConsultationLogRequest
  ): Promise<CreateLogResponse> {
    return this.statisticsService.createConsultationLog(request);
  }

  @Post('free-tour-logs')
  @ApiOperation({ summary: '자가점검(프리투어) 로그 생성' })
  @ApiResponse({
    status: 201,
    description: '자가점검 로그 생성 성공',
    schema: { $ref: getSchemaPath(CreateLogResponse) },
  })
  async createFreeTourLog(
    @Body() request: CreateFreeTourLogRequest
  ): Promise<CreateLogResponse> {
    return this.statisticsService.createFreeTourLog(request);
  }
}
