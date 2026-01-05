import { Module, Logger } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService, ConfigType } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import redisConfig, { CacheLocationEnum } from '@/config/redis.config';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisCacheModule');
        const redisConf =
          configService.get<ConfigType<typeof redisConfig>>('redis');
        const cacheTtlMs = redisConf?.cacheTtlMs ?? 600_000;

        const useRedisCache =
          redisConf?.store === CacheLocationEnum.REDIS && !!redisConf?.host;

        if (!useRedisCache) {
          logger.warn(
            `Redis cache disabled: store=${redisConf?.store}, host=${redisConf?.host}`
          );
          return { ttl: cacheTtlMs, max: 100 };
        }

        try {
          const socket = redisConf.useTLS
            ? { host: redisConf.host, port: redisConf.port, tls: true as const }
            : { host: redisConf.host, port: redisConf.port };

          const store = await redisStore({
            socket,
            username: redisConf.username,
            password: redisConf.password,
            database: redisConf.db,
            keyPrefix: redisConf.cacheKeyPrefix,
            ttl: Math.floor(cacheTtlMs / 1000),
          });

          logger.log(
            `Redis cache connected: ${redisConf.host}:${redisConf.port} db=${redisConf.db}`
          );
          return { store, ttl: cacheTtlMs };
        } catch (e: any) {
          logger.error(
            `Redis cache init failed -> fallback to memory: ${e?.message ?? e}`
          );
          return { ttl: cacheTtlMs, max: 100 };
        }
      },
    }),
  ],
})
export class RedisCacheModule {}
