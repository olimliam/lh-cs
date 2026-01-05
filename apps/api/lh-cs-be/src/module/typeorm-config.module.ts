import dbConfig from '@/config/db.config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const config = dbConfig() as any;
        return {
          ...config,
        };
      },
    }),
  ],
})
export class TypeOrmConfigModule {}
