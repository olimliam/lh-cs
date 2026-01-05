import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { ConsultationEntity } from '../infrastructure/repository/entity/consultation.entity';
import { ConsultationHistoryEntity } from '../infrastructure/repository/entity/consultation-history.entity';
import { ReadConsultationEntity } from '../infrastructure/repository/entity/read-consultation.entity';
import { UserEntity } from '../infrastructure/repository/entity/user.entity';
import { TourEntity } from '../infrastructure/repository/entity/tour.entity';
import { FacilityEntity } from '../infrastructure/repository/entity/facility.entity';

// Repositories
import { ConsultationCommandRepository } from '../infrastructure/repository/command/consultation-command.repository';
import { ConsultationQueryRepository } from '../infrastructure/repository/query/consultation-query.repository';
import { ReadConsultationRepository } from '../infrastructure/repository/query/read-consultation.repository';

// Services & Controllers
import { ConsultationService } from '../application/service/consultation.service';
import { ConsultationController } from '../presentation/controller/consultation.controller';
import { CreateConsultationUseCase } from '../application/use-case/consultation/create-consultation.use-case';
import { StartConsultationUseCase } from '../application/use-case/consultation/start-consultation.use-case';
import { RequestEndConsultationUseCase } from '../application/use-case/consultation/request-end-consultation.use-case';
import { FinalizeEndConsultationUseCase } from '../application/use-case/consultation/finalize-end-consultation.use-case';
import { RestartConsultationUseCase } from '../application/use-case/consultation/restart-consultation.use-case';
import { UpdateConsultationStatusByVisitorConnectionUseCase } from '../application/use-case/consultation/update-consultation-status-by-visitor-connection.use-case';
import { UpdateConsultationStatusUseCase } from '../application/use-case/consultation/update-consultation-status.use-case';
import { UpdateConsultationStatusByConnectionUseCase } from '../application/use-case/consultation/update-consultation-status-by-connection.use-case';
import { UpdateVisitorIdUseCase } from '../application/use-case/consultation/update-visitor-id.use-case';
import { GetAllActiveConsultationsUseCase } from '../application/use-case/consultation/get-all-active-consultations.use-case';
import { GetConsultationByIdUseCase } from '../application/use-case/consultation/get-consultation-by-id.use-case';
import { FindConsultationByEnterCodeUseCase } from '../application/use-case/consultation/find-consultation-by-enter-code.use-case';
import { SearchConsultationsUseCase } from '../application/use-case/consultation/search-consultations.use-case';
import { GetDashboardStatsUseCase } from '../application/use-case/consultation/get-dashboard-stats.use-case';
import { FindConsultationByEnterCodeForVisitorUseCase } from '../application/use-case/consultation/find-consultation-by-enter-code-for-visitor.use-case';
import { FindActiveConsultationByVisitorIdUseCase } from '../application/use-case/consultation/find-active-consultation-by-visitor-id.use-case';
import { GetConsultationVisitorInfoUseCase } from '../application/use-case/consultation/get-consultation-visitor-info.use-case';
import { UserRepository } from '../infrastructure/repository/user.repository';

// Utils
import { ConsultationCodeGenerator } from '../common/utils/consultation-code-generator';
import { LoggerModule } from './logger.module';
import { WebSocketModule } from './websocket.module';
import { StatisticsModule } from './statistics.module';
import { ConsultationSchedulerJobs } from '@/jobs/consultation-scheduler.jobs';
import { LockModule } from './lock.module';
import { UserModule } from './user.module';
import { ZoomVideoSdkModule } from './zoom-video-sdk.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Main Entities
      ConsultationEntity,
      ConsultationHistoryEntity,
      ReadConsultationEntity,

      // Related Entities
      UserEntity,
      TourEntity,
      FacilityEntity,
    ]),
    forwardRef(() => LoggerModule),
    forwardRef(() => WebSocketModule),
    forwardRef(() => LockModule),
    StatisticsModule,
    forwardRef(() => UserModule),
    ZoomVideoSdkModule,
  ],
  controllers: [ConsultationController],
  providers: [
    // Repositories (CQRS 패턴)
    ConsultationCommandRepository,
    ConsultationQueryRepository,
    ReadConsultationRepository,
    UserRepository,

    // Utils
    ConsultationCodeGenerator,

    // Services
    CreateConsultationUseCase,
    StartConsultationUseCase,
    RequestEndConsultationUseCase,
    FinalizeEndConsultationUseCase,
    RestartConsultationUseCase,
    UpdateConsultationStatusByVisitorConnectionUseCase,
    UpdateConsultationStatusUseCase,
    UpdateConsultationStatusByConnectionUseCase,
    UpdateVisitorIdUseCase,
    GetAllActiveConsultationsUseCase,
    GetConsultationByIdUseCase,
    FindConsultationByEnterCodeUseCase,
    SearchConsultationsUseCase,
    GetDashboardStatsUseCase,
    FindConsultationByEnterCodeForVisitorUseCase,
    FindActiveConsultationByVisitorIdUseCase,
    GetConsultationVisitorInfoUseCase,
    ConsultationService,
    ConsultationSchedulerJobs,
  ],
  exports: [
    // 다른 모듈에서 사용할 수 있도록 export
    ConsultationService,
    ConsultationCommandRepository,
    ConsultationQueryRepository,
    ReadConsultationRepository,
    ConsultationSchedulerJobs,
  ],
})
export class ConsultationModule {}
