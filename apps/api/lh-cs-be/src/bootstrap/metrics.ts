import type { NestExpressApplication } from '@nestjs/platform-express';
import { register } from 'prom-client';
import type { Request, Response } from 'express';

export function setupMetricsRoute(app: NestExpressApplication) {
  app.getHttpAdapter().get('/metrics', async (_req: Request, res: Response) => {
    res.setHeader('Content-Type', register.contentType); // text/plain; version=0.0.4
    res.end(await register.metrics());
  });
}
