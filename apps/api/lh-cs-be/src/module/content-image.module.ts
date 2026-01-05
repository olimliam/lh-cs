import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentImageEntity } from '@/infrastructure/repository/entity/content-image.entity';
import { ContentImageRepository } from '@/infrastructure/repository/content-image.repository';
import { ContentImageService } from '@/application/service/content-image.service';
import { S3ClientService } from '@/common/s3/s3-client.service';
import { ContentImageController } from '@/presentation/controller/content-image.controller';
import { AuthModule } from './auth.module';
import { UserModule } from './user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentImageEntity]), AuthModule, UserModule],
  controllers: [ContentImageController],
  providers: [
    Logger,
    ContentImageRepository,
    ContentImageService,
    S3ClientService,
  ],
  exports: [ContentImageRepository, ContentImageService],
})
export class ContentImageModule {}
