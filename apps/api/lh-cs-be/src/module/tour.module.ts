import { Module, Logger, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourEntity } from '../infrastructure/repository/entity/tour.entity';
import { TourFacilityEntity } from '../infrastructure/repository/entity/tour-facility.entity';
import { FacilityEntity } from '../infrastructure/repository/entity/facility.entity';
import { TourRepository } from '../infrastructure/repository/tour.repository';
import { TourFacilityRepository } from '../infrastructure/repository/tour-facility.repository';
import { FacilityRepository } from '../infrastructure/repository/facility.repository';
import { TourService } from '../application/service/tour.service';
import { TourFacilityService } from '../application/service/tour-facility.service';
import { TourFacilityImportService } from '../application/service/tour-facility-import.service';
import { TourController } from '../presentation/controller/tour.controller';
import { TourFacilityController } from '../presentation/controller/tour-facility.controller';
import { LoggerModule } from './logger.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TourEntity, TourFacilityEntity, FacilityEntity]),
    forwardRef(() => LoggerModule),
  ],
  controllers: [TourController, TourFacilityController],
  providers: [
    Logger,
    TourRepository,
    TourFacilityRepository,
    FacilityRepository,
    TourService,
    TourFacilityService,
    TourFacilityImportService,
  ],
  exports: [
    TourService,
    TourRepository,
    TourFacilityService,
    TourFacilityRepository,
    TourFacilityImportService,
  ],
})
export class TourModule {}
