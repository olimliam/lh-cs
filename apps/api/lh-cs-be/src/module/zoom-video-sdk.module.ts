import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZoomVideoSdkService } from '@/application/zoom/zoom-video-sdk.service';
import { ZoomVideoSdkController } from '@/presentation/controller/zoom-video-sdk.controller';
import { ZoomSessionLogEntity } from '@/infrastructure/repository/entity/zoom-session-log.entity';
import { ZoomSessionLogRepository } from '@/infrastructure/repository/zoom-session-log.repository';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([ZoomSessionLogEntity])],
  controllers: [ZoomVideoSdkController],
  providers: [ZoomVideoSdkService, ZoomSessionLogRepository],
  exports: [ZoomVideoSdkService, ZoomSessionLogRepository],
})
export class ZoomVideoSdkModule {}
