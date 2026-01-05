import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityEntity } from '../infrastructure/repository/entity/facility.entity';
import { FacilityRepository } from '../infrastructure/repository/facility.repository';
import { FacilityService } from '../application/service/facility.service';
import { FacilityController } from '../presentation/controller/facility.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FacilityEntity])],
  controllers: [FacilityController],
  providers: [Logger, FacilityRepository, FacilityService],
  exports: [FacilityService, FacilityRepository],
})
export class FacilityModule {}
