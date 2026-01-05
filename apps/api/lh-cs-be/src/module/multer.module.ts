import { attachmentConfig } from '@/config/attachment.config';
import { Module } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const attachment =
          configService.get<ConfigType<typeof attachmentConfig>>('attachment');
        const maxSizeBytes = attachment?.maxSizeBytes ?? 10 * 1024 * 1024;
        return {
          limits: { fileSize: maxSizeBytes },
        };
      },
    }),
  ],
})
export class MulterConfigModule {}
