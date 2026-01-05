import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from '@/presentation/controller/statistics.controller';
import { StatisticsService } from '@/application/service/statistics.service';
import { AdminLogEntity } from '@/infrastructure/repository/entity/admin-log.entity';
import { LoginLogEntity } from '@/infrastructure/repository/entity/login-log.entity';
import { FreeTourLogEntity } from '@/infrastructure/repository/entity/free-tour-log.entity';
import { ConsultationLogEntity } from '@/infrastructure/repository/entity/consultation-log.entity';
import { ConsultationEntity } from '@/infrastructure/repository/entity/consultation.entity';
import { TourFacilityEntity } from '@/infrastructure/repository/entity/tour-facility.entity';
import { TourEntity } from '@/infrastructure/repository/entity/tour.entity';
import { FacilityEntity } from '@/infrastructure/repository/entity/facility.entity';
import { TourStatsDailyEntity } from '@/infrastructure/repository/entity/tour-stats-daily.entity';
import { TourFacilityStatsDailyEntity } from '@/infrastructure/repository/entity/tour-facility-stats-daily.entity';
import { AdminLogRepository } from '@/infrastructure/repository/admin-log.repository';
import { LoginLogRepository } from '@/infrastructure/repository/login-log.repository';
import { FreeTourLogRepository } from '@/infrastructure/repository/free-tour-log.repository';
import { ConsultationLogRepository } from '@/infrastructure/repository/consultation-log.repository';
import { ConsultationStatisticsRepository } from '@/infrastructure/repository/consultation-statistics.repository';
import { ConsultationStatisticsV2Repository } from '@/infrastructure/repository/consultation-statistics-v2.repository';
import { UserModule } from './user.module';
import { StatisticsAggregationService } from '@/application/service/statistics-aggregation.service';
import { StatisticsAggregationJobs } from '@/jobs/statistics-aggregation.jobs';
import { LockModule } from './lock.module';
import { IpEncryptionService } from '@/application/service/ip-encryption.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminLogEntity,
      LoginLogEntity,
      FreeTourLogEntity,
      ConsultationLogEntity,
      ConsultationEntity,
      TourFacilityEntity,
      TourEntity,
      FacilityEntity,
      TourStatsDailyEntity,
      TourFacilityStatsDailyEntity,
    ]),
    UserModule,
    LockModule,
  ],
  controllers: [StatisticsController],
  providers: [
    StatisticsService,
    IpEncryptionService,
    AdminLogRepository,
    LoginLogRepository,
    FreeTourLogRepository,
    ConsultationLogRepository,
    ConsultationStatisticsRepository,
    ConsultationStatisticsV2Repository,
    StatisticsAggregationService,
    StatisticsAggregationJobs,
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
