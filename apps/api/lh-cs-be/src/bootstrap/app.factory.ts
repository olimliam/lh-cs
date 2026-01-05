import { Logger, ValidationPipe, RequestMethod } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService, ConfigType } from '@nestjs/config';

import { AppModule } from '../module/app.module';
import redisConfig from '../config/redis.config';
import { attachmentConfig } from '../config/attachment.config';

import { setupMetricsRoute } from './metrics';
import { setupSwagger } from './swagger';
import { setupCors } from './cors';
import { setupBodyLimits } from './body-limits';
import { setupSession } from './session';
import { setupMiddlewares } from './middlewares';

export async function bootstrapApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'healthz', method: RequestMethod.GET },
      { path: 'healthz', method: RequestMethod.HEAD },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // NOTE: 숫자형 필드 암묵 변환 방지
      transformOptions: { enableImplicitConversion: false },
    })
  );

  setupMetricsRoute(app);

  const configService = app.get(ConfigService);
  const redisConf = configService.get<ConfigType<typeof redisConfig>>('redis');
  const attachmentConf =
    configService.get<ConfigType<typeof attachmentConfig>>('attachment');

  setupCors(app);
  setupMiddlewares(app);
  setupBodyLimits(app, attachmentConf);
  await setupSession(app, redisConf);
  setupSwagger(app);

  const logger = app.get(Logger);
  const port = Number(process.env.PORT ?? 8080);

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
}
