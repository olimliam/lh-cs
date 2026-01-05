import { attachmentConfig } from '@/config/attachment.config';
import redisConfig from '@/config/redis.config';
import smsConfig from '@/config/sms.config';
import visionAiConfig from '@/config/vision-ai.config';
import { AppController } from '@/presentation/controller/app.controller';
import { HealthController } from '@/presentation/controller/health.controller';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth.module';
import { RedisCacheModule } from './cache.module';
import { ClsConfigModule } from './cls.config.module';
import { ConsultationModule } from './consultation.module';
import { ContentImageModule } from './content-image.module';
import { FacilityModule } from './facility.module';
import { HttpRelayModule } from './http-relay.module';
import { LoggerModule } from './logger.module';
import { MetricsModule } from './metrics.module';
import { NotificationModule } from './notification.module';
import { QuestionAnswerModule } from './question-answer.module';
import { StatisticsModule } from './statistics.module';
import { TourModule } from './tour.module';
import { TypeOrmConfigModule } from './typeorm-config.module';
import { UserModule } from './user.module';
import { WebSocketModule } from './websocket.module';
import { ZoomVideoSdkModule } from './zoom-video-sdk.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [visionAiConfig, redisConfig, smsConfig, attachmentConfig],
    }),
    ScheduleModule.forRoot(),
    HttpRelayModule,
    ConsultationModule,
    TourModule,
    FacilityModule,
    AuthModule,
    UserModule,
    LoggerModule,
    WebSocketModule,
    StatisticsModule,
    NotificationModule,
    QuestionAnswerModule,
    MetricsModule,
    ZoomVideoSdkModule,
    ContentImageModule,
    RedisCacheModule,
    MulterModule,
    ClsConfigModule,
    TypeOrmConfigModule,
  ],
  controllers: [AppController, HealthController],
})
export class AppModule {}
