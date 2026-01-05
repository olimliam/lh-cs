import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from '@/infrastructure/repository/entity/notification.entity';
import { ContentAttachmentEntity } from '@/infrastructure/repository/entity/content-attachment.entity';
import { NotificationRepository } from '@/infrastructure/repository/notification.repository';
import { ContentAttachmentRepository } from '@/infrastructure/repository/content-attachment.repository';
import { NotificationService } from '@/application/service/notification.service';
import { NotificationController } from '@/presentation/controller/notification.controller';
import { S3ClientService } from '@/common/s3/s3-client.service';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';
import { ContentImageModule } from './content-image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, ContentAttachmentEntity]),
    AuthModule,
    UserModule,
    ContentImageModule,
  ],
  controllers: [NotificationController],
  providers: [
    Logger,
    NotificationRepository,
    ContentAttachmentRepository,
    NotificationService,
    S3ClientService,
  ],
  exports: [
    NotificationService,
    NotificationRepository,
    ContentAttachmentRepository,
  ],
})
export class NotificationModule {}
