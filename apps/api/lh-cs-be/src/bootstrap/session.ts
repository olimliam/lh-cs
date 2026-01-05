import { Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { createClient } from 'redis';
import type { RedisConfig } from '../config/redis.config';
import { CacheLocationEnum } from '../config/redis.config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { RedisStore } = require('connect-redis');

export async function setupSession(
  app: NestExpressApplication,
  redisConf?: RedisConfig
) {
  const logger = app.get(Logger);

  const useRedisStore = redisConf?.store === CacheLocationEnum.REDIS;
  let store: session.Store | undefined;

  if (useRedisStore && redisConf) {
    const socket = redisConf.useTLS
      ? { host: redisConf.host, port: redisConf.port, tls: true as const }
      : { host: redisConf.host, port: redisConf.port };

    const redisClient = createClient({
      socket,
      username: redisConf.username,
      password: redisConf.password,
      database: redisConf.db,
    });

    // @ts-expect-error connect-redis v9 + node-redis 조합에서 legacyMode가 필요할 수 있음
    redisClient.legacyMode = true;

    redisClient.on('error', (err) => logger.error('Redis session error', err));

    try {
      await redisClient.connect();
      logger.log(
        `Redis client connected (host=${redisConf.host}, port=${redisConf.port}, db=${redisConf.db}, tls=${redisConf.useTLS})`,
        'Bootstrap'
      );

      store = new RedisStore({
        client: redisClient as any,
        prefix: redisConf.keyPrefix,
        ttl: redisConf.sessionTTL,
        disableTouch: false,
      });

      logger.log(`Redis session store ready`, 'Bootstrap');
    } catch (err) {
      logger.error('Redis session init failed -> fallback to MemoryStore', err);
      store = undefined;
    }
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        maxAge: (redisConf?.sessionTTL ?? 60 * 60 * 24) * 1000,
        httpOnly: true,
        secure: false,
        sameSite: process.env.NODE_ENV === 'prd' ? 'strict' : 'lax',
      },
      name: 'sessionId',
    })
  );
}
