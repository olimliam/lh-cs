import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionAnswerEntity } from '@/infrastructure/repository/entity/question-answer.entity';
import { ContentAttachmentEntity } from '@/infrastructure/repository/entity/content-attachment.entity';
import { QuestionAnswerRepository } from '@/infrastructure/repository/question-answer.repository';
import { ContentAttachmentRepository } from '@/infrastructure/repository/content-attachment.repository';
import { QuestionAnswerService } from '@/application/service/question-answer.service';
import { QuestionAnswerController } from '@/presentation/controller/question-answer.controller';
import { S3ClientService } from '@/common/s3/s3-client.service';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';
import { ContentImageModule } from './content-image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuestionAnswerEntity, ContentAttachmentEntity]),
    AuthModule,
    UserModule,
    ContentImageModule,
  ],
  controllers: [QuestionAnswerController],
  providers: [
    Logger,
    QuestionAnswerRepository,
    ContentAttachmentRepository,
    QuestionAnswerService,
    S3ClientService,
  ],
  exports: [
    QuestionAnswerService,
    QuestionAnswerRepository,
    ContentAttachmentRepository,
  ],
})
export class QuestionAnswerModule {}
