import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

export function setupMiddlewares(app: NestExpressApplication) {
  app.use(cookieParser());
}
